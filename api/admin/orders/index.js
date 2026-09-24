import { checkAdminPasscode } from '../../../lib/adminAuth.js'
import { listOrders, isRedisConfigured } from '../../../lib/orderStore.js'

export default async function handler(req, res) {
  if (checkAdminPasscode(req, res)) return
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isRedisConfigured()) return res.status(200).json({ orders: [], configured: false })
  const orders = await listOrders()
  return res.status(200).json({ orders, configured: true })
}
