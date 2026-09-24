import { SITE } from '../../src/data/site.js'
import { checkAdminPasscode } from '../../lib/adminAuth.js'
import { sendMail } from '../../lib/mailer.js'
import { buildEmailHtml, escapeHtml } from '../../lib/emailTemplate.js'
import { getEnquiry, markEnquiryReplied } from '../../lib/enquiryStore.js'

const TYPE_LABEL = { contact: 'contact', wholesale: 'wholesale', newsletter: 'newsletter' }

export default async function handler(req, res) {
  if (checkAdminPasscode(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { enquiryId, message } = req.body || {}
  if (!enquiryId || !message) return res.status(400).json({ error: 'enquiryId and message are required' })

  let enquiry = null
  try { enquiry = await getEnquiry(enquiryId) } catch (err) { console.error('getEnquiry failed:', err.message) }
  if (!enquiry) return res.status(404).json({ error: "Enquiry not found — storage may not be configured yet. Use the enquiry notification email's \"Reply by Email\" link instead." })
  if (!enquiry.email) return res.status(400).json({ error: 'This enquiry has no email address to reply to' })

  const typeLabel = TYPE_LABEL[enquiry.type] || 'website'
  const html = buildEmailHtml({
    title: `Re: your ${typeLabel} enquiry`,
    intro: `Hi ${escapeHtml(enquiry.name || 'there')},`,
    rows: [{ label: 'Reply', html: escapeHtml(message).replace(/\n/g, '<br>') }],
    secondaryCta: { label: 'Contact Us', url: `${SITE.url}/contact/` },
  })

  const result = await sendMail({
    to: enquiry.email,
    subject: `Re: your ${typeLabel} enquiry — ${SITE.brand}`,
    html,
    text: message,
  })

  if (!result.sent) return res.status(503).json({ error: 'Email is not configured yet' })

  try { await markEnquiryReplied(enquiryId) } catch (err) { console.error('markEnquiryReplied failed:', err.message) }

  return res.status(200).json({ ok: true })
}
