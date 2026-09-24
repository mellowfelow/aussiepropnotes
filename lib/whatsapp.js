import { SITE } from '../src/data/site.js'
import { paymentTermsLines } from './order.js'

// Bold site name, prepended to every WhatsApp message in both directions so
// brand identity survives regardless of contact names or profile photos.
export const WA_HEADER = `*${SITE.brand}*`

export function toWhatsAppNumber(phone) {
  const cc = SITE.reply.channels.whatsappCountryCode
  const digits = String(phone || '').replace(/[^0-9]/g, '')
  if (!digits) return ''
  if (digits.startsWith(cc)) return digits
  if (digits.startsWith('0')) return cc + digits.slice(1)
  return cc + digits
}

function asText(body) {
  return Array.isArray(body) ? body.join('\n') : body
}

export function waMessageText(body) {
  return [WA_HEADER, '', asText(body)].join('\n')
}

export function waLinkTo(phone, body) {
  const num = toWhatsAppNumber(phone)
  return `https://wa.me/${num}?text=${encodeURIComponent(waMessageText(body))}`
}

// New-order notification to the operator's own WhatsApp.
export function waOrderLink(order) {
  const lines = [
    `New order ${order.orderNumber}`,
    '',
    ...order.items.map((i) => `${i.quantity} × ${i.name} — ${SITE.currency} $${i.price}`),
    '',
    `Total: ${SITE.currency} $${order.amountDue}`,
    `Payment: ${order.paymentMethod}`,
    `Customer: ${order.customerName} (${order.customerEmail || order.customerPhone || 'no contact given'})`,
  ]
  return waLinkTo(SITE.whatsapp, lines)
}

// Customer → business, pre-composed payment-confirmation message.
export function waPaymentConfirmationLink(orderNumber) {
  const lines = [`Here's my payment confirmation for order ${orderNumber}.`]
  return waLinkTo(SITE.whatsapp, lines)
}

// Admin → customer, mirrors the payment-details email exactly (same
// paymentTermsLines source — email/WhatsApp content parity is a rule).
export function waPaymentDetailsMessage({ orderNumber, amountDue, methodLabel, instructions, methodId }) {
  const terms = paymentTermsLines(methodId, orderNumber).map((l) => `✅ ${l}`)
  return [
    `Payment details for order ${orderNumber}`,
    '',
    `Amount due: ${SITE.currency} $${amountDue}`,
    `Method: ${methodLabel}`,
    '',
    instructions,
    '',
    ...terms,
  ]
}

export function waPaymentDetailsLink(phone, opts) {
  return waLinkTo(phone, waPaymentDetailsMessage(opts))
}
