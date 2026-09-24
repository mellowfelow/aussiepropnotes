import { get, set, del, zadd, zrem, zrangeAllDesc, isRedisConfigured } from './redis.js'

// StoredEnquiry shape:
// { id, type: 'contact' | 'wholesale', name, email, phone, message,
//   meta: Record<string,string>, status: 'new' | 'replied', createdAt }

const key = (id) => `enquiry:${id}`
const INDEX = 'enquiry:index'

export { isRedisConfigured }

export function generateEnquiryId() {
  const time = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `ENQ-${time}-${rand}`
}

export async function saveEnquiry(enquiry) {
  await set(key(enquiry.id), enquiry)
  await zadd(INDEX, Date.parse(enquiry.createdAt), enquiry.id)
}

export async function listEnquiries() {
  const ids = await zrangeAllDesc(INDEX)
  const enquiries = await Promise.all(ids.map((id) => get(key(id))))
  return enquiries.filter(Boolean)
}

export async function getEnquiry(id) {
  return get(key(id))
}

export async function markEnquiryReplied(id) {
  const enquiry = await get(key(id))
  if (!enquiry) return null
  enquiry.status = 'replied'
  await set(key(id), enquiry)
  return enquiry
}

export async function deleteEnquiry(id) {
  await del(key(id))
  await zrem(INDEX, id)
}
