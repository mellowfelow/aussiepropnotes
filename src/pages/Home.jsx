import React from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS, CATEGORIES, FAQS, SITE } from '../data/site.js'
import { ProductCard, TrustBar } from '../components/ui.jsx'

export default function Home() {
  const featured = PRODUCTS.filter(p => ['aud-100-full-print-prop-notes','money-stack-bundle-100k','aged-distressed-aud-prop-notes','usd-100-full-print-prop-notes','money-gun-prop-bills-bundle','custom-branded-prop-notes','photography-flat-lay-set','euro-100-prop-notes'].includes(p.slug))
  return (
    <main>
      <section className="hero">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-guilloche" aria-hidden="true" />
        <div className="hero-inner">
          <p className="eyebrow">Sydney-founded · Shipping Australia-wide since {SITE.founded}</p>
          <h1>Australian Prop Money for Film, TV, Photography &amp; Events</h1>
          <p className="hero-sub">Aussie Prop Notes is Australia's specialist prop money supplier — camera-ready AUD prop notes, money stacks and custom printed notes, all RBA-guideline compliant and dispatched nationwide in one business day.</p>
          <div className="hero-cta">
            <Link className="btn btn-lg" to="/shop/">Shop prop money</Link>
            <Link className="btn btn-lg btn-ghost" to="/wholesale/">Wholesale &amp; trade</Link>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="section">
        <h2>Shop by category</h2>
        <div className="cat-grid">
          {CATEGORIES.map(c => (
            <Link key={c.slug} to={'/shop/' + c.slug + '/'} className="cat-card">
              <strong>{c.name}</strong>
              <span>{c.desc.split('.')[0]}.</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <h2>Best-selling prop money</h2>
        <div className="pgrid">
          {featured.map(p => <ProductCard key={p.slug} p={p} />)}
        </div>
        <p className="center"><Link className="btn" to="/shop/">View all products</Link></p>
      </section>

      <section className="section authority">
        <h2>About Aussie Prop Notes</h2>
        <p>Founded in Sydney in {SITE.founded}, Aussie Prop Notes supplies camera-ready prop money to productions, photographers and event companies across Australia. Through 2023 and 2024 our notes appeared in work by leading film productions, music producers, and hundreds of content creators and photographers nationwide. Every note we print follows RBA reproduction guidelines — reduced scale, clear prop markings, no replicated security features — so your production stays on the right side of the law without compromising how the money reads on camera. We ship nationwide from Sydney, with a ${SITE.minOrder} AUD minimum order, free shipping over ${SITE.freeShipOver} AUD, and a {SITE.cryptoDiscount}% discount on every crypto payment.</p>
        <div className="auth-grid">
          <div><strong>{SITE.founded}</strong><span>Founded in Sydney</span></div>
          <div><strong>12+</strong><span>Product lines in stock</span></div>
          <div><strong>1 day</strong><span>Dispatch from Sydney</span></div>
          <div><strong>100%</strong><span>RBA-guideline compliant</span></div>
        </div>
      </section>

      <section className="section section-alt">
        <h2>Prop money questions, answered</h2>
        <div className="faq-list">
          {FAQS.slice(0, 4).map(f => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
        <p className="center"><Link to="/faq/">Read all FAQs</Link> · <Link to="/blog/is-prop-money-legal-australia/">Is prop money legal in Australia?</Link></p>
      </section>
    </main>
  )
}
