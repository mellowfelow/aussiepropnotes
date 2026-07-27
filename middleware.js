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

// q-value-aware negotiation: only serve markdown when the client actually
// prefers it over HTML. A naive substring check on the Accept header would
// also match crawlers that send BOTH types (e.g. "text/html, text/markdown;
// q=0.9") and wrongly hand them the stripped-down markdown extract — which
// is missing the JSON-LD schema and full page richness the HTML has, a real
// regression for any AI engine that actually prefers the HTML.
function prefersMarkdownOverHtml(accept) {
  let mdQ = -1, htmlQ = -1
  for (const part of accept.split(',')) {
    const [type, ...params] = part.trim().split(';').map(s => s.trim())
    let q = 1
    for (const p of params) {
      const m = /^q=([\d.]+)$/.exec(p)
      if (m) q = parseFloat(m[1])
    }
    if (type === 'text/markdown') mdQ = Math.max(mdQ, q)
    if (type === 'text/html') htmlQ = Math.max(htmlQ, q)
  }
  return mdQ > -1 && mdQ > htmlQ
}

export const config = { matcher: '/:path*' }

export default async function middleware(request) {
  const url = new URL(request.url)
  const { pathname } = url

  const accept = request.headers.get('accept') || ''
  const wantsMarkdown = prefersMarkdownOverHtml(accept)
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
