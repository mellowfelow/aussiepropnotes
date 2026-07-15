import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { execSync } from 'child_process'

// Build an SSR bundle first, then render each route into dist/
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
process.chdir(root)

// 1. SSR entry
fs.writeFileSync('src/entry-server.jsx', `
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App.jsx'
export { ROUTES } from './routes.jsx'
export { SITE, PRODUCTS, CATEGORIES, POSTS } from './data/site.js'
export function render(url) {
  return renderToString(<StaticRouter location={url}><App /></StaticRouter>)
}
`)
execSync('npx vite build --ssr src/entry-server.jsx --outDir dist-ssr', { stdio: 'inherit' })

const { render, ROUTES, SITE } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)
const template = fs.readFileSync('dist/index.html', 'utf8')
const TODAY = '2026-07-15'

for (const r of ROUTES) {
  const html = render(r.path)
  const canonical = SITE.url + r.path
  const head = [
    `<title>${r.title}</title>`,
    `<meta name="description" content="${r.desc.replace(/"/g, '&quot;')}">`,
    r.noindex ? `<meta name="robots" content="noindex, follow">` : '',
    `<link rel="canonical" href="${canonical}">`,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">`,
    `<meta name="google-site-verification" content="${SITE.gscCode}">`,
    `<meta name="IndexNow-key" content="${SITE.indexNowKey}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE.brand}">`,
    `<meta property="og:title" content="${r.title.replace(/"/g, '&quot;')}">`,
    `<meta property="og:description" content="${r.desc.replace(/"/g, '&quot;')}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${SITE.url}/images/og-home.svg">`,
    `<meta property="og:updated_time" content="${TODAY}T09:00:00+10:00">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${r.title.replace(/"/g, '&quot;')}">`,
    `<meta name="twitter:description" content="${r.desc.replace(/"/g, '&quot;')}">`,
    `<meta name="twitter:image" content="${SITE.url}/images/og-home.svg">`,
    ...r.schema.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`),
  ].filter(Boolean).join('\n')

  const page = template.replace('<!--HEAD-->', head).replace('<!--APP-->', html)
  const outDir = path.join('dist', r.path)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), page)
}

// sitemap.xml (indexable routes only)
const urls = ROUTES.filter(r => !r.noindex).map(r =>
  `  <url><loc>${SITE.url + r.path}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')
fs.writeFileSync('dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)

// 404 page — render the homepage shell with a not-found notice (client router takes over)
const notFoundHead = [
  `<title>Page Not Found | ${SITE.brand}</title>`,
  `<meta name="description" content="That page could not be found. Browse the full Australian prop money range at Aussie Prop Notes — film, photography, event and custom prop money, shipped Australia-wide.">`,
  `<meta name="robots" content="noindex, follow">`,
  `<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">`,
  `<link rel="preconnect" href="https://fonts.googleapis.com">`,
  `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
].join('\n')
const notFoundBody = `<main class="section narrow center-page"><h1>Page not found</h1><p class="lead">We couldn't find that page. It may have moved. Browse our <a href="/shop/">full prop money range</a> or head <a href="/">home</a>.</p></main>`
fs.writeFileSync('dist/404.html', template.replace('<!--HEAD-->', notFoundHead).replace('<!--APP-->', notFoundBody))

// clean SSR artifacts + template root index.html duplicate is fine (route '/' overwrote it)
fs.rmSync('dist-ssr', { recursive: true, force: true })
fs.rmSync('src/entry-server.jsx', { force: true })
console.log('Prerendered', ROUTES.length, 'routes + sitemap')
