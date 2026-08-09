# Aussie Prop Notes

Camera-ready prop money for film, TV, photography and events. Sydney-founded, shipping Australia-wide since 2022.

React (Vite) storefront, prerendered to static HTML, deployed on Vercel.

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
- `www.aussiepropnotes.com` is canonical (matches the Vercel dashboard's domain redirect: apex -> www). There is no `redirects` entry in `vercel.json` for this — Vercel's own domain-level redirect already handles apex -> www, and adding a competing www -> apex rule in `vercel.json` created a redirect loop that broke every static asset. Don't re-add one without first checking which direction is set as primary in Vercel -> Project -> Settings -> Domains.

Import the repo in Vercel and it builds on every push to `main`. http -> https is automatic on Vercel.

### Cloudflare Pages (not the primary target for this site, kept in sync)

`public/_headers` and `public/_redirects` cover the same rules. Build command `npm run build`, output directory `dist`. For ZIP upload, run the build and upload the *contents* of `dist/`.

## Live order channels

WhatsApp (`61420126562`) and Web3Forms are both live. There is no generator script for the `.well-known/*` files in this project (unlike the Next.js WebForge template) — they're hand-maintained, so if the WhatsApp number ever changes it needs updating in `src/data/site.js`, every `.well-known/*` file, and `public/js/webmcp.js`.

## Structure

```
src/
  data/site.js        # SITE config, categories, products, FAQs, blog posts — single source of truth
  routes.jsx          # route registry: path, title, meta description, JSON-LD per page
  components/         # ui.jsx (nav/cart/cards), WebForm.jsx (Web3Forms)
  pages/              # Home, Shop, Product, Blog, Static (about/cart/order/policies)
scripts/
  genimages.mjs       # generates logo, guilloche motif, OG image (og-home.svg + rasterized og-home.png)
  prerender.mjs       # SSR each route -> dist/<path>/index.html + sitemap.xml, minifies public/js/webmcp.js
public/               # images, robots.txt, llms.txt, auth.md, .well-known/, _headers, _redirects
```

Adding a product or blog post = one entry in `src/data/site.js`; routes, schema, sitemap and nav update automatically.

## Compliance

All products are reduced-scale, clearly marked prop reproductions for film, photography, event and training use, following RBA reproduction guidelines. Not legal tender.
