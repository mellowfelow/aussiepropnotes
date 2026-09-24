import { SITE } from '../src/data/site.js'
import { sendMail } from '../lib/mailer.js'
import { buildEmailHtml } from '../lib/emailTemplate.js'
import { saveEnquiry, generateEnquiryId, isRedisConfigured } from '../lib/enquiryStore.js'

const TYPE_LABEL = { contact: 'Contact enquiry', wholesale: 'Wholesale application', newsletter: 'Newsletter signup', review: 'Customer review submission' }
const TYPE_DEST = { contact: () => SITE.email, wholesale: () => SITE.wholesaleEmail, newsletter: () => SITE.email, review: () => SITE.email }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body || {}
  const type = TYPE_LABEL[body.type] ? body.type : 'contact'
  const fields = body.fields && typeof body.fields === 'object' ? body.fields : {}

  if (body.botcheck) return res.status(200).json({ ok: true }) // honeypot: pretend success

  const email = fields.Email || fields.email || ''
  const name = fields.Name || fields['Contact Name'] || fields.name || ''
  if (type !== 'newsletter' && !email) return res.status(400).json({ error: 'Email is required' })
  if (type === 'newsletter' && !fields.email) return res.status(400).json({ error: 'Email is required' })

  const enquiry = {
    id: generateEnquiryId(),
    type,
    name,
    email: email || fields.email || '',
    phone: fields.Phone || fields.phone || '',
    message: fields.Message || fields.Requirements || '',
    meta: fields,
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  if (isRedisConfigured()) {
    try { await saveEnquiry(enquiry) } catch (err) { console.error('saveEnquiry failed:', err.message) }
  }

  const dashboardUrl = `${SITE.url}/admin/reply-enquiry/?id=${encodeURIComponent(enquiry.id)}`
  const fieldRows = Object.entries(fields)
    .filter(([k]) => k !== 'botcheck')
    .map(([label, value]) => ({ label, value: String(value || '') }))

  const html = buildEmailHtml({
    title: TYPE_LABEL[type],
    intro: `A new ${TYPE_LABEL[type].toLowerCase()} came in via ${SITE.domain}.`,
    rows: [
      { heading: true, label: 'Enquiry' },
      ...fieldRows,
    ],
    cta: isRedisConfigured() ? { label: 'Reply in Dashboard →', url: dashboardUrl } : undefined,
    secondaryCta: enquiry.email ? { label: 'Reply by Email', url: `mailto:${enquiry.email}` } : undefined,
  })

  await sendMail({
    to: TYPE_DEST[type](),
    subject: `${TYPE_LABEL[type]} — ${SITE.brand}`,
    html,
    text: `${TYPE_LABEL[type]} from ${name || enquiry.email}: ${enquiry.message || JSON.stringify(fields)}`,
    replyTo: enquiry.email || undefined,
  })

  return res.status(200).json({ ok: true })
}
