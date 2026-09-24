// Dependency-free Upstash Redis REST client. Uses the POST + JSON-array-body
// command shape (["SET", key, value]) rather than the path-based GET form,
// because the path form breaks on long JSON values (a whole order).
// Accepts four credential-var pairs so whatever Vercel's Storage tab named
// them just works.
const CREDENTIAL_CANDIDATES = [
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
  ['STORAGE_REST_API_URL', 'STORAGE_REST_API_TOKEN'],
  ['STORAGE_KV_REST_API_URL', 'STORAGE_KV_REST_API_TOKEN'],
]

function credentials() {
  for (const [urlVar, tokenVar] of CREDENTIAL_CANDIDATES) {
    const url = process.env[urlVar]
    const token = process.env[tokenVar]
    if (url && token) return { url: normaliseUrl(url), token }
  }
  return null
}

function normaliseUrl(url) {
  let u = url.trim()
  if (!/^https?:\/\//.test(u)) u = 'https://' + u
  if (u.includes('console.upstash.com')) {
    throw new Error('UPSTASH_REDIS_REST_URL looks like the Upstash dashboard URL, not the database REST endpoint — copy the "REST URL" from the database\'s Details tab instead.')
  }
  return u.replace(/\/+$/, '')
}

export function isRedisConfigured() {
  return credentials() !== null
}

async function command(args) {
  const creds = credentials()
  if (!creds) throw new Error('Redis is not configured')
  const res = await fetch(creds.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${creds.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.result
}

export async function set(key, value) {
  await command(['SET', key, JSON.stringify(value)])
}

export async function get(key) {
  const raw = await command(['GET', key])
  return raw == null ? null : JSON.parse(raw)
}

export async function del(key) {
  await command(['DEL', key])
}

export async function zadd(indexKey, score, member) {
  await command(['ZADD', indexKey, String(score), member])
}

export async function zrem(indexKey, member) {
  await command(['ZREM', indexKey, member])
}

export async function zrangeAllDesc(indexKey) {
  const members = await command(['ZRANGE', indexKey, '0', '-1', 'REV'])
  return members || []
}
