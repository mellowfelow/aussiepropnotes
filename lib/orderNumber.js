// Zero imports so the identical function runs on the client (WhatsApp
// checkout mints the ref before any server round-trip) and the server —
// the same number then appears in the WhatsApp message, the dashboard and
// the confirmation email.
export function generateOrderNumber(prefix) {
  const time = Date.now().toString(36).toUpperCase().slice(-4)
  const rand = Math.random().toString(36).toUpperCase().slice(2, 4)
  return `${prefix}-${time}${rand}`
}

export function isValidOrderNumber(ref, prefix) {
  return new RegExp(`^${prefix}-[A-Z0-9]{4,10}$`).test(ref || '')
}
