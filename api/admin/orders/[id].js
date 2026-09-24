import { checkAdminPasscode } from '../../../lib/adminAuth.js'
import { getOrder, deleteOrder, markOrderSent } from '../../../lib/orderStore.js'

export default async function handler(req, res) {
  if (checkAdminPasscode(req, res)) return
  const { id } = req.query

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
