import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  const { EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_SECURE, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD } = process.env
  if (!EMAIL_SERVER_HOST || !EMAIL_SERVER_USER || !EMAIL_SERVER_PASSWORD) return null
  transporter = nodemailer.createTransport({
    host: EMAIL_SERVER_HOST,
    port: Number(EMAIL_SERVER_PORT) || 465,
    secure: EMAIL_SERVER_SECURE !== 'false',
    auth: { user: EMAIL_SERVER_USER, pass: EMAIL_SERVER_PASSWORD },
  })
  return transporter
}

// Never throws — returns {sent:false} when unconfigured so API routes can
// respond 503 and the UI can fall back to WhatsApp/phone instead of crashing.
export async function sendMail({ to, subject, html, text, replyTo }) {
  const t = getTransporter()
  if (!t) return { sent: false, reason: 'not-configured' }
  const from = process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER
  try {
    await t.sendMail({ from, to, subject, html, text, replyTo })
    return { sent: true }
  } catch (err) {
    console.error('sendMail failed:', err.message)
    return { sent: false, reason: 'send-error' }
  }
}
