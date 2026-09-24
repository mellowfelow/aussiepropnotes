import { SITE } from '../../src/data/site.js'
import { checkAdminPasscode } from '../../lib/adminAuth.js'
import { sendMail } from '../../lib/mailer.js'
import { buildEmailHtml } from '../../lib/emailTemplate.js'
import { getOrder, markOrderSent } from '../../lib/orderStore.js'
import { paymentMethodParts, instructionsParts, paymentTermsHtml } from '../../lib/order.js'

export default async function handler(req, res) {
  if (checkAdminPasscode(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { orderNumber, methodId, detail, customEmail } = req.body || {}
  if (!orderNumber || !methodId) return res.status(400).json({ error: 'orderNumber and methodId are required' })

  let order = null
  try { order = await getOrder(orderNumber) } catch (err) { console.error('getOrder failed:', err.message) }
  const to = customEmail || (order && order.customerEmail)
  if (!to) return res.status(400).json({ error: 'No destination email — pass customEmail or save the order first' })

  const amount = order ? order.amountDue : (req.body.amount || '')
  const { method, opening, closing } = paymentMethodParts(methodId, amount, orderNumber)
  const instructions = instructionsParts(opening, detail || '', closing)

  const html = buildEmailHtml({
    title: 'Payment details for your order',
    refBadge: orderNumber,
    intro: `Here's how to complete payment for order ${orderNumber}.`,
    rows: [
      { label: 'Amount Due', value: `${SITE.currency} $${amount}`, highlight: true },
      { label: 'Payment Method', value: method.label },
      { heading: true, label: 'How to Pay' },
      { block: true, value: instructions },
    ],
    afterRows: paymentTermsHtml(methodId, orderNumber),
    secondaryCta: { label: 'Contact Us', url: `${SITE.url}/contact/` },
  })

  const result = await sendMail({
    to,
    subject: `Payment details — order ${orderNumber} — ${SITE.brand}`,
    html,
    text: `Payment details for order ${orderNumber}. Amount due: ${SITE.currency} $${amount}. Method: ${method.label}.\n\n${instructions}`,
  })

  if (!result.sent) return res.status(503).json({ error: 'Email is not configured yet' })

  if (order) { try { await markOrderSent(orderNumber) } catch (err) { console.error('markOrderSent failed:', err.message) } }

  return res.status(200).json({ ok: true })
}
