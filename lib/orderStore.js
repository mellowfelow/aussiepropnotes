import { get, set, del, zadd, zrem, zrangeAllDesc, isRedisConfigured } from './redis.js'

// StoredOrder shape:
// { orderNumber, customerName, customerEmail, customerPhone, address,
//   items: [{ name, quantity, price }], subtotal, amountDue, paymentMethod,
//   notes, status: 'pending' | 'payment-sent', channel: 'whatsapp' | 'email',
//   createdAt }

const key = (orderNumber) => `order:${orderNumber}`
const INDEX = 'order:index'

export { isRedisConfigured }

export async function saveOrder(order) {
  await set(key(order.orderNumber), order)
  await zadd(INDEX, Date.parse(order.createdAt), order.orderNumber)
}

export async function listOrders() {
  const ids = await zrangeAllDesc(INDEX)
  const orders = await Promise.all(ids.map((id) => get(key(id))))
  return orders.filter(Boolean)
}

export async function getOrder(orderNumber) {
  return get(key(orderNumber))
}

export async function markOrderSent(orderNumber) {
  const order = await get(key(orderNumber))
  if (!order) return null
  order.status = 'payment-sent'
  await set(key(orderNumber), order)
  return order
}

export async function deleteOrder(orderNumber) {
  await del(key(orderNumber))
  await zrem(INDEX, orderNumber)
}
