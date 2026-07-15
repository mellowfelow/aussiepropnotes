import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PRODUCTS, CATEGORIES, SITE } from '../data/site.js'
import { Breadcrumbs, ProductCard, QtyStepper, addToCart, fmt } from '../components/ui.jsx'

export default function Product() {
  const { slug } = useParams()
  const p = PRODUCTS.find(x => x.slug === slug)
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  if (!p) return <main className="section"><h1>Product not found</h1><p><Link to="/shop/">Back to shop</Link></p></main>
  const cat = CATEGORIES.find(c => c.slug === p.cat)
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.slug !== p.slug).slice(0, 3)
  return (
    <main className="section">
      <Breadcrumbs trail={[['Shop', '/shop/'], [cat.name, '/shop/' + cat.slug + '/'], [p.name, null]]} />
      <div className="pdp">
        <div className="pdp-img">
          <img src={'/images/' + p.slug + '.webp'} alt={p.name + ' — Australian prop money by Aussie Prop Notes'} width="600" height="450" loading="eager" />
        </div>
        <div className="pdp-info">
          {p.badge && <span className={'badge badge-' + p.badge.toLowerCase().replace(/ /g, '-')}>{p.badge}</span>}
          <h1>{p.name}</h1>
          <p className="price price-lg">{fmt(p.price)}</p>
          <p>{p.desc}</p>
          <div className="pdp-cta">
            <QtyStepper qty={qty} setQty={setQty} label={p.name} />
            <button type="button" className="btn btn-lg" onClick={() => { addToCart(p.slug, qty); setAdded(true); setQty(1); setTimeout(() => setAdded(false), 1600) }}>{added ? 'Added to cart ✓' : 'Add to cart'}</button>
            <Link className="btn btn-lg btn-ghost" to="/cart/">View cart</Link>
          </div>
          <ul className="pdp-meta">
            <li>Dispatched from Sydney in 1 business day</li>
            <li>Free shipping Australia-wide over ${SITE.freeShipOver} AUD</li>
            <li>{SITE.cryptoDiscount}% discount on crypto payments</li>
            <li>Minimum order ${SITE.minOrder} AUD</li>
          </ul>
          <p className="compliance">For film, TV, photography, training and event use only. Not legal tender. All notes are reduced-scale and clearly marked as props in line with RBA reproduction guidelines. See our <Link to="/terms/">terms</Link>.</p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="section-tight">
          <h2>You may also like</h2>
          <div className="pgrid">
            {related.map(r => <ProductCard key={r.slug} p={r} />)}
          </div>
        </section>
      )}
      <p>Planning a shoot? Read the <Link to="/blog/australian-prop-money-buyers-guide-film-tv/">complete film &amp; TV prop money guide</Link> or ask about <Link to="/wholesale/">wholesale pricing</Link>.</p>
    </main>
  )
}
