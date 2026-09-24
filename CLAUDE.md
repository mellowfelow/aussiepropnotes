# Aussie Prop Notes — project instructions

Camera-ready prop money storefront. React (Vite), prerendered to static HTML, deployed on Vercel via GitHub. Forms and the Reply Portal admin dashboard run as plain Vercel serverless functions under `api/` (Node `(req, res)` handlers, no Next.js) — see "Reply Portal" below.

## Non-negotiable: RBA compliance wording

This is a prop-money site — word choice carries real legal and platform-ad-policy risk. Authority: Crimes (Currency) Act 1981 + RBA reproduction guidelines + Meta advertising policy.

**Banned — never use, anywhere (copy, alt text, schema, llms.txt, blog, product descriptions, URL slugs):**
fake money, counterfeit, undetectable, indistinguishable, passes the pen test, 1:1 scale, full size/full-scale, legal tender, real currency, spendable.

Compliant replacements in use: "no monetary value" / "never for use as genuine money" (not "not legal tender"); "exact-size copy" (not "1:1 scale"); "government-issued banknote" / "genuine currency" (not "real currency"); "MOTION PICTURE USE ONLY" as the example prop marking. A grep for the banned list across `src/` and `public/` must come back clean.

**Required framing — every product description must convey:**
reduced scale, clearly marked as a prop, no replicated security features (no holograms, no UV ink, no clear windows/security thread).

**Prohibited claims:** never imply a note could pass as real currency, never imply RBA/government endorsement.

If a request would require breaking any of the above, stop and say so rather than complying.

## Architecture

`src/data/site.js` is the single source of truth — `SITE` config, `CATEGORIES`, `PRODUCTS`, `POSTS`, `FAQS`, plus `PRODUCT_DETAILS` (per-product specs/use/FAQ, keyed by slug), `CATEGORY_INTRO` (per-category intro paragraphs, keyed by slug), and `CONFIGURABLE_SETS` (bundle products where the buyer picks up to `max` note types from `SET_NOTE_OPTIONS` — price is flat, the choice rides on the cart line as `mix` and is written into the order text). `STACK_TIERS` is the `money-stacks` category's build-your-own products: the buyer allocates the tier's `notes` count across `SET_NOTE_OPTIONS` denominations in multiples of `step`, the running total must equal `notes` before Add to cart enables, price is flat, and the split rides on the cart line as `mix` (`["300 × AUD $100", …]`). `NOTE_VALUE` maps each denomination to a face value for the picker's live screen-value readout; `stackDefaultMix(slug)` is the whole count in AUD $100 (a mix equal to it is treated as non-custom). A slug is in `CONFIGURABLE_SETS` **or** `STACK_TIERS`, never both. `money-stack-bundle-100k` keeps its slug (blog links point at it) but is now a `STACK_TIERS` product in `money-stacks`. Cart lines are keyed by `key` = slug, or slug+mix for a customised set. Adding one product/post entry generates its page, route, meta, JSON-LD, sitemap entry and nav link via `src/routes.jsx`. Never hand-write a page for a product or post. When adding a product, add its `PRODUCT_DETAILS` entry too (a missing entry degrades gracefully but the PDP will be thin).

SEO cross-linking data, also in `site.js`: `POST_CLUSTERS` (5 topical groups; every post slug appears in exactly one) drives the `/blog/` hub layout, the per-post "Related guides" block (`relatedPosts(slug)` = cluster siblings, topped up), and the `ItemList` schema on `/blog/`. `CATEGORY_FAQ` (3 Q&As per category) renders on the category page and is emitted as `FAQPage` schema in `routes.jsx`. `PRODUCT_GUIDE` / `CATEGORY_GUIDE` map a product to its most relevant blog post for the PDP "related guide" link. When adding a post, add its slug to a `POST_CLUSTERS` entry or it won't appear on `/blog/`. Blog posts may set `modified: 'YYYY-MM-DD'` — it drives the visible "Updated" line, `dateModified`, and the sitemap `lastmod`. `scripts/prerender.mjs` also emits an image sitemap (product + category + home images) inside `sitemap.xml`.

There is no `.well-known/*` generator in this project — those files, `robots.txt`, `llms.txt`, `auth.md`, and the WhatsApp number in `public/js/webmcp.js` are hand-maintained. If `SITE.whatsapp` or `SITE.domain` ever changes, update all of those files too (grep for the old value across `public/`).

## Rules

- `npm run build` must succeed before every push (runs `vite build` then `scripts/prerender.mjs`, which renders every route to static HTML, generates `sitemap.xml`, generates `dist/meta-catalog.csv` — the product feed for Meta Commerce Manager / Pinterest catalogs, keyed off `PRODUCTS` — and minifies `public/js/webmcp.js`).
- `/links/` is a `noindex` link hub for social-media bios (Instagram/TikTok allow one link). The footer + homepage carry a `NewsletterSignup` that POSTs `{type:'newsletter', fields:{email}}` to `/api/contact` — same SMTP pipe as every other form, not a managed list.
- Form `name` attributes are the email labels — keep them human ("Delivery Address", "Payment Method", "Requirements"), not `snake_case`. `WebForm.jsx` POSTs `{type, fields}` JSON to `/api/contact`; `Order` in `Static.jsx` POSTs a structured order object to `/api/order` (see `lib/order.js`, `lib/emailTemplate.js`). The WhatsApp checkout path also fire-and-forgets a POST to `/api/order` (channel:'whatsapp') so it lands in the Reply Portal dashboard alongside email-channel orders. `fmt()` shows cents only when the amount has them.
- Exactly one `<h1>` per page. Meta descriptions ~150 chars (Google ≤160), assembled via `clampDesc()` in `routes.jsx` so they never truncate mid-word. Titles ≤60 chars, except blog posts which append ` | Aussie Prop Notes` and may run to ~78 (deliberate — keeps `<title>` distinct from `<h1>`). On `/blog/` and its post cards the page `<h1>` is the only h1; cluster titles are `<h2>`, card titles `<h3>`.
- Renaming a post slug: add a 301 in `vercel.json` `redirects` from the old path (the sitemap and internal links regenerate, but external links and the index don't).
- Never emit `numberOfItems` directly on a `Store`/`Organization`/`LocalBusiness` schema block — it belongs on `OfferCatalog` (see `/shop/` route in `src/routes.jsx`).
- `SearchAction` schema on the homepage points at `/shop/?q=` — that route must keep actually filtering products (see `src/pages/Shop.jsx`). Don't let the schema and the real behaviour drift apart.
- Emails entity-encoded (`&#64;`) everywhere, including inside JSON-LD — never plaintext.
- Never commit `node_modules/`, `dist/`.

## Never fabricate brand facts (Rule 5)

Only state track record we can actually verify: founded Sydney 2022, ships Australia-wide, RBA-guideline compliant. Do not name specific clients, productions, or quantify "how many" customers/productions unless a real, attributable name or number is supplied — vague claims like "leading productions" or "hundreds of creators" get flagged by AI-visibility audits as unverifiable and read as fabricated if an AI engine cites them as fact. No invented awards, press mentions, or partnerships.

## Live order channel

`SITE.whatsapp` in `src/data/site.js` is the real number (`61420126562`) — WhatsApp is a live order channel alongside email/SMTP (see Reply Portal below). Every plain "chat" link is built with `waHref()` (from `site.js`), which pre-fills `SITE.whatsappGreeting` ("Hi Aussie Prop") so incoming messages are identifiable as website enquiries; the `/order/` flow builds its own detailed order text instead. If it ever changes, update it in `src/data/site.js` AND `public/.well-known/acp.json`, `public/.well-known/agent-skills/index.json`, `public/.well-known/mcp/server-card.json`, `public/.well-known/ucp`, and `public/js/webmcp.js`.

## Reply Portal (admin dashboard + transactional email)

`SITE.reply` in `src/data/site.js` is the single source of truth for the admin dashboard and every outbound email (brand accent, header tagline, order prefix, payment methods, deadline hours) — never hardcode a colour, prefix or method elsewhere. Plumbing lives in `lib/` (`redis.js`, `orderStore.js`, `enquiryStore.js`, `adminAuth.js`, `mailer.js`, `emailTemplate.js`, `order.js`, `whatsapp.js`) and is invariant; only `SITE.reply` content varies. API endpoints are plain Vercel serverless functions in `api/` (`order.js`, `contact.js`, `admin/verify.js`, `admin/orders/`, `admin/enquiries/`, `admin/send-payment-email.js`, `admin/reply-enquiry.js`) — every `api/admin/*` handler calls `checkAdminPasscode(req, res)` first. The admin UI (`src/pages/Admin.jsx`, `src/components/admin/PasscodeGate.jsx`, `src/hooks/useAdminPasscode.js`) is passcode-gated client-side React reached at `/admin/`, `/admin/orders/`, `/admin/enquiries/`, `/admin/send-payment-email/?id=`, `/admin/reply-enquiry/?id=` — all `noindex`, disallowed in `robots.txt`, excluded from the public nav/footer/chat chrome in `App.jsx`, and served `Cache-Control: no-store` via `vercel.json`.

**Live placeholders — nothing works until these are set as Vercel env vars (never in the repo):**
- `EMAIL_SERVER_HOST` / `EMAIL_SERVER_PORT` / `EMAIL_SERVER_SECURE` / `EMAIL_SERVER_USER` / `EMAIL_SERVER_PASSWORD` / `EMAIL_FROM` — without these, `lib/mailer.js#sendMail()` returns `{sent:false}` and every form silently doesn't email (WhatsApp still works). Also needs SPF/DKIM/DMARC DNS records for deliverability once set.
- `ADMIN_PASSCODE` — without it, every `/api/admin/*` route returns 503 and the dashboard is permanently locked out.
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or any of the 3 aliased pairs `lib/redis.js` accepts) — without these, orders/enquiries still email through but never appear in the dashboard.

Every layer degrades gracefully in that order — the site never crashes for a missing env var, it just quietly loses the feature that depends on it. Web3Forms has been fully removed; there is no fallback form provider.
