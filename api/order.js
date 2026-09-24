import { SITE } from '../src/data/site.js'
import { sendMail } from '../lib/mailer.js'
import { buildEmailHtml, escapeHtml } from '../lib/emailTemplate.js'
import { saveOrder, isRedisConfigured } from '../lib/orderStore.js'
import { isValidOrderNumber } from '../lib/orderNumber.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body || {}
  const { orderNumber, channel, customerName, customerEmail, customerPhone, address, items, subtotal, amountDue, paymentMethod, notes } = body

  if (!orderNumber || !isValidOrderNumber(orderNumber, SITE.reply.orderPrefix) || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'Invalid order payload' })
  }

  const order = {
    orderNumber,
    customerName: customerName || '',
    customerEmail: customerEmail || '',
    customerPhone: customerPhone || '',
    address: address || '',
    items,
    subtotal: subtotal || 0,
    amountDue: amountDue || 0,
    paymentMethod: paymentMethod || '',
    notes: notes || '',
    status: 'pending',
    channel: channel === 'whatsapp' ? 'whatsapp' : 'email',
    createdAt: new Date().toISOString(),
  }

  if (isRedisConfigured()) {
    try { await saveOrder(order) } catch (err) { console.error('saveOrder failed:', err.message) }
  }

  const itemRows = items.map((i) => ({ label: `${i.quantity} × ${i.name}`, value: `${SITE.currency} $${(i.price * i.quantity).toFixed(2)} (${SITE.currency} $${i.price} ea)` }))
  const dashboardUrl = `${SITE.url}/admin/send-payment-email/?id=${encodeURIComponent(orderNumber)}`

  const adminHtml = buildEmailHtml({
    title: 'New order',
    refBadge: orderNumber,
    intro: `${escapeHtml(order.customerName || 'A customer')} placed an order via ${order.channel === 'whatsapp' ? 'WhatsApp' : 'the website'}.`,
    rows: [
      { heading: true, label: 'Customer' },
      { label: 'Name', value: order.customerName },
      { label: 'Email', value: order.customerEmail },
      { label: 'Phone', value: order.customerPhone },
      { label: 'Address', value: order.address },
      { heading: true, label: 'Items' },
      ...itemRows,
      ...(order.notes ? [{ heading: true, label: 'Notes' }, { label: '', value: order.notes }] : []),
      { heading: true, label: 'Summary' },
      { label: 'Subtotal', value: `${SITE.currency} $${order.subtotal}` },
      { label: 'Payment Method', value: order.paymentMethod },
      { label: 'Amount Due', value: `${SITE.currency} $${order.amountDue}`, highlight: true },
    ],
    cta: isRedisConfigured() ? { label: 'Reply in Dashboard →', url: dashboardUrl } : undefined,
  })

  await sendMail({
    to: SITE.ordersEmail,
    subject: `New order ${orderNumber} — ${SITE.currency} $${order.amountDue} — ${SITE.brand}`,
    html: adminHtml,
    text: `New order ${orderNumber} from ${order.customerName}. Amount due: ${SITE.currency} $${order.amountDue}.`,
    replyTo: order.customerEmail || undefined,
  })

  if (order.customerEmail) {
    const customerHtml = buildEmailHtml({
      title: "We've received your order",
      refBadge: orderNumber,
      intro: `Thanks, ${escapeHtml(order.customerName)} — this confirms we've received your order. Keep this email as your reference. You'll receive a second email shortly with payment details; once that's confirmed we'll finalise your order for dispatch.`,
      rows: [
        { heading: true, label: 'Items' },
        ...itemRows,
        { heading: true, label: 'Delivering To' },
        { label: 'Address', value: order.address || '—' },
        { label: 'Amount Due', value: `${SITE.currency} $${order.amountDue}`, highlight: true },
      ],
      secondaryCta: { label: 'Contact Us', url: `${SITE.url}/contact/` },
    })
    await sendMail({
      to: order.customerEmail,
      subject: `Order received — ${orderNumber} — ${SITE.currency} $${order.amountDue} — ${SITE.brand}`,
      html: customerHtml,
      text: `Thanks — we've received order ${orderNumber}. Amount due: ${SITE.currency} $${order.amountDue}. A payment-details email will follow shortly.`,
    })
  }

  return res.status(200).json({ ok: true })
}
