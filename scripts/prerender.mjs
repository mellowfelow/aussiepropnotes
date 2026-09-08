import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { execSync } from 'child_process'
import { minify } from 'terser'

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

const { render, ROUTES, SITE, PRODUCTS, CATEGORIES } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)
const template = fs.readFileSync('dist/index.html', 'utf8')
const TODAY = new Date().toISOString().slice(0, 10)

// Minimal HTML -> Markdown conversion of the page's <main> content, for
// Accept: text/markdown negotiation (see middleware.js). Not pixel-perfect —
// good enough for an agent to read the page's actual content as text.
function htmlToMarkdown(html) {
  const main = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)
  let s = main ? main[1] : html
  s = s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, (_, t) => `\n# ${strip(t)}\n\n`)
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (_, t) => `\n## ${strip(t)}\n\n`)
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, (_, t) => `\n### ${strip(t)}\n\n`)
  s = s.replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, t) => {
    const label = strip(t)
    return label ? `[${label}](${href.startsWith('http') ? href : SITE.url + href})` : ''
  })
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_, t) => `- ${strip(t)}\n`)
  s = s.replace(/<\/(p|div|section|summary|details)>/g, '\n\n')
  s = s.replace(/<[^>]+>/g, '')
  s = s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#64;/g, '@')
    .replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ')
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  return s
  function strip(t) { return t.replace(/<[^>]+>/g, '').trim() }
}

// Per-route social image: product pages use their own photo, everything else
// the branded 1200x630 card. Product photos are 600x450, so the dimensions and
// type are declared to match rather than the card's.
const ogImageFor = (routePath) => {
  const pm = /^\/product\/([^/]+)\/$/.exec(routePath)
  if (pm) return { url: `${SITE.url}/images/${pm[1]}.webp`, type: 'image/webp', w: 600, h: 450 }
  return { url: `${SITE.url}/images/og-home.png`, type: 'image/png', w: 1200, h: 630 }
}

for (const r of ROUTES) {
  const html = render(r.path)
  const canonical = SITE.url + r.path
  const og = ogImageFor(r.path)
  const head = [
    `<title>${r.title}</title>`,
    `<meta name="description" content="${r.desc.replace(/"/g, '&quot;')}">`,
    r.noindex ? `<meta name="robots" content="noindex, follow">` : '',
    `<link rel="canonical" href="${canonical}">`,
    `<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>`,
    r.path === '/' ? `<link rel="preload" href="/images/hero.jpg" as="image" fetchpriority="high">` : '',
    `<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">`,
    `<meta name="google-site-verification" content="${SITE.gscCode}">`,
    `<meta name="IndexNow-key" content="${SITE.indexNowKey}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE.brand}">`,
    `<meta property="og:title" content="${r.title.replace(/"/g, '&quot;')}">`,
    `<meta property="og:description" content="${r.desc.replace(/"/g, '&quot;')}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${og.url}">`,
    `<meta property="og:image:type" content="${og.type}">`,
    `<meta property="og:image:width" content="${og.w}">`,
    `<meta property="og:image:height" content="${og.h}">`,
    `<meta property="og:updated_time" content="${TODAY}T09:00:00+10:00">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${r.title.replace(/"/g, '&quot;')}">`,
    `<meta name="twitter:description" content="${r.desc.replace(/"/g, '&quot;')}">`,
    `<meta name="twitter:image" content="${og.url}">`,
    ...r.schema.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`),
  ].filter(Boolean).join('\n')

  const page = template.replace('<!--HEAD-->', head).replace('<!--APP-->', html)
  const outDir = path.join('dist', r.path)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), page)

  if (!r.noindex) {
    const md = `# ${r.title}\n\n> ${r.desc}\n\n${htmlToMarkdown(html)}\n`
    fs.writeFileSync(path.join(outDir, 'index.md'), md)
  }
}

// Minify static scripts that ship from public/ as-is (Vite copies public/
// verbatim, it doesn't run them through the JS bundler/minifier).
for (const file of ['js/webmcp.js']) {
  const dest = path.join('dist', file)
  const { code } = await minify(fs.readFileSync(dest, 'utf8'))
  fs.writeFileSync(dest, code)
}

// sitemap.xml (indexable routes only). Blog posts carry their own publish/
// modified date so the sitemap doesn't claim every post changed on every build;
// pages that are genuinely regenerated each build keep TODAY. Product pages and
// the homepage also declare their image(s) via the image sitemap extension, so
// Google Images can index the product photography.
const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const routeImages = (routePath) => {
  const m = /^\/product\/([^/]+)\/$/.exec(routePath)
  if (m) return [`${SITE.url}/images/${m[1]}.webp`]
  const cm = /^\/shop\/([^/]+)\/$/.exec(routePath)
  if (cm) return PRODUCTS.filter(p => p.cat === cm[1]).slice(0, 6).map(p => `${SITE.url}/images/${p.slug}.webp`)
  if (routePath === '/') return [`${SITE.url}/images/hero.jpg`, `${SITE.url}/images/og-home.png`]
  return []
}
const urls = ROUTES.filter(r => !r.noindex).map(r => {
  const imgs = routeImages(r.path).map(u => `<image:image><image:loc>${xmlEsc(u)}</image:loc></image:image>`).join('')
  return `  <url><loc>${SITE.url + r.path}</loc><lastmod>${r.lastmod || TODAY}</lastmod>${imgs}</url>`
}).join('\n')
fs.writeFileSync('dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`)

// Product data feed — for Meta Commerce Manager (Facebook / Instagram Shopping)
// and Pinterest catalogs. Point a scheduled feed at
// https://www.aussiepropnotes.com/meta-catalog.csv. Descriptions use the
// compliant `short` copy; every row links to the real product page.
const csv = (s) => `"${String(s).replace(/"/g, '""')}"`
const feed = ['id,title,description,availability,condition,price,link,image_link,brand,product_type',
  ...PRODUCTS.map(p => {
    const c = CATEGORIES.find(x => x.slug === p.cat)
    return [
      p.slug,
      csv(p.name),
      csv(p.short),
      'in stock',
      'new',
      p.price.toFixed(2) + ' AUD',
      SITE.url + '/product/' + p.slug + '/',
      SITE.url + '/images/' + p.slug + '.webp',
      csv(SITE.brand),
      csv(c ? c.name : 'Prop money'),
    ].join(',')
  })].join('\n') + '\n'
fs.writeFileSync('dist/meta-catalog.csv', feed)

// 404 page — render the homepage shell with a not-found notice (client router takes over)
const notFoundHead = [
  `<title>Page Not Found | ${SITE.brand}</title>`,
  `<meta name="description" content="That page could not be found. Browse the full Australian prop money range at Aussie Prop Notes — film, photography, event and custom prop money, shipped Australia-wide.">`,
  `<meta name="robots" content="noindex, follow">`,
  `<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">`,
].join('\n')
const notFoundBody = `<main class="section narrow center-page"><h1>Page not found</h1><p class="lead">We couldn't find that page. It may have moved. Browse our <a href="/shop/">full prop money range</a> or head <a href="/">home</a>.</p></main>`
fs.writeFileSync('dist/404.html', template.replace('<!--HEAD-->', notFoundHead).replace('<!--APP-->', notFoundBody))

// IndexNow — notify Bing / Yandex of the current indexable URL set. Production
// deploys only (VERCEL_ENV=production), so local and preview builds never ping.
// Non-fatal: a failure here must not break the build.
if (process.env.VERCEL_ENV === 'production' && SITE.indexNowKey && !SITE.indexNowKey.startsWith('YOUR-')) {
  const host = new URL(SITE.url).host
  const urlList = ROUTES.filter(r => !r.noindex).map(r => SITE.url + r.path)
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: SITE.indexNowKey,
        keyLocation: `${SITE.url}/${SITE.indexNowKey}.txt`,
        urlList,
      }),
    })
    console.log('IndexNow:', res.status, '·', urlList.length, 'urls submitted')
  } catch (e) {
    console.warn('IndexNow submission failed (non-fatal):', e.message)
  }
}

// clean SSR artifacts + template root index.html duplicate is fine (route '/' overwrote it)
fs.rmSync('dist-ssr', { recursive: true, force: true })
fs.rmSync('src/entry-server.jsx', { force: true })
console.log('Prerendered', ROUTES.length, 'routes + sitemap')
