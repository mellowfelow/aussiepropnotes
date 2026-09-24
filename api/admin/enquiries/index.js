import { checkAdminPasscode } from '../../../lib/adminAuth.js'
import { listEnquiries, isRedisConfigured } from '../../../lib/enquiryStore.js'

export default async function handler(req, res) {
  if (checkAdminPasscode(req, res)) return
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isRedisConfigured()) return res.status(200).json({ enquiries: [], configured: false })
  const enquiries = await listEnquiries()
  return res.status(200).json({ enquiries, configured: true })
}
