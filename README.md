# Aussie Prop Notes

Camera-ready prop money for film, TV, photography and events. Sydney-founded, shipping Australia-wide since 2022.

React (Vite) storefront, prerendered to static HTML for Cloudflare Pages.

## Stack

- **React 18** + **react-router-dom 6**
- **Vite 5** build, custom prerenderer (`scripts/prerender.mjs`) renders every route to static HTML
- No backend — cart is client-side (localStorage), orders go via WhatsApp or Web3Forms
- Agent-ready: `llms.txt`, `auth.md`, `.well-known/*`, WebMCP tools

## Develop

```bash
npm install
npm run dev      # vite dev server
npm run build    # vite build + prerender all routes into dist/
```

`npm run build` outputs a complete static site in `dist/` — 57 pages, sitemap, and all agent-ready files.

## Deploy

### Vercel (git-connected — recommended)

`vercel.json` is committed and configures everything:
- Build command `npm run build`, output directory `dist`
- `trailingSlash: true` (every route is prerendered as `<path>/index.html`)
- Security headers, CSP, `Link:` header for agent discovery
- Content-Types + CORS for `llms.txt`, `auth.md` and `.well-known/*`
- Cache-Control for `/assets`, `/images`, `/js`
- www -> apex 301 (update the `www.DOMAIN.com` host value to your real domain)

Import the repo in Vercel and it builds on every push to `main`. http -> https is automatic on Vercel.

### Cloudflare Pages

`public/_headers` and `public/_redirects` cover the same rules. Build command `npm run build`, output directory `dist`. For ZIP upload, run the build and upload the *contents* of `dist/`.

> Both config sets ship in the repo and are ignored by the other platform, so either target works.

## Before going live — required find & replace

The repo ships with safe placeholders. Replace across all files:

| Placeholder | Replace with |
|---|---|
| `DOMAIN.com` | your real domain |
| `61400000000` | your real WhatsApp number |
| `info@ / orders@ / wholesale@DOMAIN.com` | your real inboxes |
| `YOUR-WEB3FORMS-KEY` | your Web3Forms access key |
| `GSC-VERIFICATION-CODE` | your Google Search Console tag |

Most live in `src/data/site.js` (SITE object) and `public/` (robots, llms.txt, .well-known/*).

Until a Web3Forms key is set, forms redirect to the thank-you page without emailing — **WhatsApp is the live order channel**.

## Structure

```
src/
  data/site.js        # SITE config, categories, products, FAQs, blog posts — single source of truth
  routes.jsx          # route registry: path, title, meta description, JSON-LD per page
  components/         # ui.jsx (nav/cart/cards), WebForm.jsx (Web3Forms)
  pages/              # Home, Shop, Product, Blog, Static (about/cart/order/policies)
scripts/
  genimages.mjs       # generates logo, guilloche motif, OG image
  prerender.mjs       # SSR each route -> dist/<path>/index.html + sitemap.xml
public/               # images, robots.txt, llms.txt, auth.md, .well-known/, _headers, _redirects
```

Adding a product or blog post = one entry in `src/data/site.js`; routes, schema, sitemap and nav update automatically.

## Compliance

All products are reduced-scale, clearly marked prop reproductions for film, photography, event and training use, following RBA reproduction guidelines. Not legal tender.
