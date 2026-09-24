// Query-param based (?id=...) rather than a [id].js dynamic route: Vercel's
// trailingSlash:true redirects /api/admin/order/X to /api/admin/order/X/,
// which a bracketed [id].js function does NOT match (404) — plain function
// files handle the trailing-slash redirect correctly, dynamic segments don't.
import { checkAdminPasscode } from '../../lib/adminAuth.js'
import { getOrder, deleteOrder, markOrderSent, isRedisConfigured } from '../../lib/orderStore.js'

export default async function handler(req, res) {
  if (checkAdminPasscode(req, res)) return
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id is required' })

  if (!isRedisConfigured()) return res.status(404).json({ error: "Storage isn't configured yet" })

  if (req.method === 'GET') {
    const order = await getOrder(id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    return res.status(200).json({ order })
  }
  if (req.method === 'DELETE') {
    await deleteOrder(id)
    return res.status(200).json({ ok: true })
  }
  if (req.method === 'PATCH') {
    const order = await markOrderSent(id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    return res.status(200).json({ order })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
