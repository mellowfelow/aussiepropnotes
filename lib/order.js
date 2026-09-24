import { SITE } from '../src/data/site.js'

function fillTokens(str, tokens) {
  return str.replace(/\{(\w+)\}/g, (_, k) => (tokens[k] != null ? tokens[k] : ''))
}

// Returns {opening, closing} for the chosen payment method, tokens filled.
export function paymentMethodParts(methodId, amount, ref) {
  const method = SITE.reply.paymentMethods.find((m) => m.id === methodId) || SITE.reply.paymentMethods[0]
  const tokens = { amount, ref }
  return {
    method,
    opening: fillTokens(method.opening, tokens),
    closing: fillTokens(method.closing, tokens),
  }
}

// The admin only ever pastes the variable detail (BSB/account, PayID handle,
// wallet address) — greeting, framing and terms are generated.
export function instructionsParts(opening, detail, closing) {
  return [opening, detail, closing].filter(Boolean).join('\n\n')
}

// Single source for the standing payment terms — rendered as plain text
// (WhatsApp) and as an HTML <ul> (email). Never duplicate this list inline
// anywhere else.
export function paymentTermsLines(methodId, ref) {
  const method = SITE.reply.paymentMethods.find((m) => m.id === methodId)
  const { channels, deadlineHours, dispatchLine } = SITE.reply
  const lines = [
    `Complete payment within ${deadlineHours}h to confirm this order.`,
    `Use your order number — ${ref} — as the payment reference.`,
  ]
  if (method && method.instantRailNote) lines.push(method.instantRailNote)
  if (dispatchLine) lines.push(dispatchLine)
  const confirmTo = channels.whatsapp
    ? `${channels.email} or WhatsApp ${channels.whatsapp}`
    : channels.email
  lines.push(`Once paid, send a screenshot of the completed payment to ${confirmTo} for confirmation.`)
  return lines
}

export function paymentTermsHtml(methodId, ref) {
  const { whatsapp } = SITE.reply.channels
  const waHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : null
  const accent = SITE.reply.brand.primary
  const items = paymentTermsLines(methodId, ref)
    .map((l) => {
      let escaped = l.replace(/&/g, '&amp;').replace(/</g, '&lt;')
      // Make the WhatsApp number a real tap-to-chat link when this line mentions it.
      if (waHref && escaped.includes(whatsapp)) {
        escaped = escaped.replace(whatsapp, `<a href="${waHref}" style="color:${accent};font-weight:700;text-decoration:underline">${whatsapp}</a>`)
      }
      return `<li style="margin:0 0 6px;color:#4B4F56">${escaped}</li>`
    })
    .join('')
  return `<ul style="margin:8px 0 0;padding-left:18px;font:13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">${items}</ul>`
}
