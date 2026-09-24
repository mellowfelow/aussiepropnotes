import { checkAdminPasscode } from '../../../lib/adminAuth.js'
import { getEnquiry, deleteEnquiry } from '../../../lib/enquiryStore.js'

export default async function handler(req, res) {
  if (checkAdminPasscode(req, res)) return
  const { id } = req.query

  if (req.method === 'GET') {
    const enquiry = await getEnquiry(id)
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' })
    return res.status(200).json({ enquiry })
  }
  if (req.method === 'DELETE') {
    await deleteEnquiry(id)
    return res.status(200).json({ ok: true })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
