# Aussie Prop Notes — project instructions

Camera-ready prop money storefront. React (Vite), prerendered to static HTML, deployed on Vercel via GitHub.

## Non-negotiable: RBA compliance wording

This is a prop-money site — word choice carries real legal and platform-ad-policy risk. Authority: Crimes (Currency) Act 1981 + RBA reproduction guidelines + Meta advertising policy.

**Banned — never use, anywhere (copy, alt text, schema, llms.txt, blog, product descriptions):**
fake money, counterfeit, undetectable, indistinguishable, passes the pen test, 1:1 scale, full size/full-scale, legal tender, real currency, spendable.

**Required framing — every product description must convey:**
reduced scale, clearly marked as a prop, no replicated security features (no holograms, no UV ink, no clear windows/security thread).

**Prohibited claims:** never imply a note could pass as real currency, never imply RBA/government endorsement.

If a request would require breaking any of the above, stop and say so rather than complying.

## Architecture

`src/data/site.js` is the single source of truth — `SITE` config, `CATEGORIES`, `PRODUCTS`, `POSTS`, `FAQS`. Adding one product/post entry generates its page, route, meta, JSON-LD, sitemap entry and nav link via `src/routes.jsx`. Never hand-write a page for a product or post.

There is no `.well-known/*` generator in this project — those files, `robots.txt`, `llms.txt`, `auth.md`, and the WhatsApp number in `public/js/webmcp.js` are hand-maintained. If `SITE.whatsapp` or `SITE.domain` ever changes, update all of those files too (grep for the old value across `public/`).

## Rules

- `npm run build` must succeed before every push (runs `vite build` then `scripts/prerender.mjs`, which renders every route to static HTML, generates `sitemap.xml`, and minifies `public/js/webmcp.js`).
- Exactly one `<h1>` per page. Meta descriptions ~150 chars (Google ≤160). Titles ≤60 chars.
- Never emit `numberOfItems` directly on a `Store`/`Organization`/`LocalBusiness` schema block — it belongs on `OfferCatalog` (see `/shop/` route in `src/routes.jsx`).
- `SearchAction` schema on the homepage points at `/shop/?q=` — that route must keep actually filtering products (see `src/pages/Shop.jsx`). Don't let the schema and the real behaviour drift apart.
- Emails entity-encoded (`&#64;`) everywhere, including inside JSON-LD — never plaintext.
- Never commit `node_modules/`, `dist/`.

## Never fabricate brand facts (Rule 5)

Only state track record we can actually verify: founded Sydney 2022, ships Australia-wide, RBA-guideline compliant. Do not name specific clients, productions, or quantify "how many" customers/productions unless a real, attributable name or number is supplied — vague claims like "leading productions" or "hundreds of creators" get flagged by AI-visibility audits as unverifiable and read as fabricated if an AI engine cites them as fact. No invented awards, press mentions, or partnerships.

## Live order channel

`SITE.whatsapp` in `src/data/site.js` is the real number (`61420126562`) — WhatsApp is the live order channel (Web3Forms key is also set and working). If it ever changes, update it in `src/data/site.js` AND `public/.well-known/acp.json`, `public/.well-known/agent-skills/index.json`, `public/.well-known/mcp/server-card.json`, `public/.well-known/ucp`, and `public/js/webmcp.js`.
