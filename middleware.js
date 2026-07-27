import { next } from '@vercel/functions'

// Vercel static hosting serves these extensionless .well-known files as
// application/octet-stream (no recognized file extension to sniff from).
// Force the correct Content-Type so JSON/linkset consumers parse them.
const JSON_PATHS = new Set([
  '/.well-known/oauth-authorization-server',
  '/.well-known/oauth-protected-resource',
  '/.well-known/openid-configuration',
  '/.well-known/ucp',
  '/.well-known/acp.json',
])
const LINKSET_PATH = '/.well-known/api-catalog'

// Paths that never have a markdown counterpart — skip negotiation for these.
const NO_MARKDOWN_PREFIXES = ['/assets/', '/images/', '/fonts/', '/js/', '/.well-known/']
const NO_MARKDOWN_EXACT = new Set(['/robots.txt', '/sitemap.xml', '/llms.txt', '/auth.md'])

export const config = { matcher: '/:path*' }

export default async function middleware(request) {
  const url = new URL(request.url)
  const { pathname } = url

  if (JSON_PATHS.has(pathname)) {
    return next({ headers: { 'content-type': 'application/json; charset=utf-8' } })
  }
  if (pathname === LINKSET_PATH) {
    return next({ headers: { 'content-type': 'application/linkset+json; charset=utf-8' } })
  }

  const accept = request.headers.get('accept') || ''
  const wantsMarkdown = accept.includes('text/markdown')
  const eligible = !NO_MARKDOWN_PREFIXES.some(p => pathname.startsWith(p)) && !NO_MARKDOWN_EXACT.has(pathname)

  if (wantsMarkdown && eligible) {
    const mdPath = pathname.endsWith('/') ? pathname + 'index.md' : pathname + '/index.md'
    const mdUrl = new URL(mdPath, request.url)
    const mdRes = await fetch(mdUrl)
    if (mdRes.ok) {
      const body = await mdRes.text()
      return new Response(body, {
        status: 200,
        headers: { 'content-type': 'text/markdown; charset=utf-8' },
      })
    }
  }

  return next()
}
