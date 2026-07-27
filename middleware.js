import { next } from '@vercel/functions'

// NOTE: Vercel serves everything under /.well-known/* through a path that
// bypasses both vercel.json `headers` rules and this middleware entirely
// (confirmed live: no Link/CSP/security headers reach responses from that
// path either). That means the Content-Type on the extensionless files in
// there (ucp, oauth-authorization-server, etc.) can't be corrected from
// here — a Vercel platform limitation, not a config bug. Those checks
// already pass on isitagentready.com despite it, except the optional/
// unscored UCP commerce check, so it isn't worth routing around.

// Paths that never have a markdown counterpart — skip negotiation for these.
const NO_MARKDOWN_PREFIXES = ['/assets/', '/images/', '/fonts/', '/js/', '/.well-known/']
const NO_MARKDOWN_EXACT = new Set(['/robots.txt', '/sitemap.xml', '/llms.txt', '/auth.md'])

export const config = { matcher: '/:path*' }

export default async function middleware(request) {
  const url = new URL(request.url)
  const { pathname } = url

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
