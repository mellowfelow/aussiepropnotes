import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PRODUCTS, CATEGORIES, SITE, PRODUCT_DETAILS, CONFIGURABLE_SETS, SET_NOTE_OPTIONS, PRODUCT_GUIDE, CATEGORY_GUIDE, POSTS } from '../data/site.js'
import { Breadcrumbs, ProductCard, QtyStepper, addToCart, openCartDrawer, fmt } from '../components/ui.jsx'

export default function Product() {
  const { slug } = useParams()
  const p = PRODUCTS.find(x => x.slug === slug)
  const cfg = CONFIGURABLE_SETS[slug]
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const [mix, setMix] = useState(cfg ? cfg.default : null)
  if (!p) return <main className="section"><h1>Product not found</h1><p><Link to="/shop/">Back to shop</Link></p></main>
  const cat = CATEGORIES.find(c => c.slug === p.cat)
  const d = PRODUCT_DETAILS[p.slug]
  const toggleNote = (note) => setMix(cur => {
    if (cur.includes(note)) return cur.length > 1 ? cur.filter(n => n !== note) : cur
    return cur.length < cfg.max ? [...cur, note] : cur
  })
  // Cyclic "related" pick: every product links to the next 3 in its category
  // (wrapping around), so each product ends up with 3 incoming sibling links
  // instead of only the first few products in a large category getting them.
  const catProducts = PRODUCTS.filter(x => x.cat === p.cat)
  const ci = catProducts.findIndex(x => x.slug === p.slug)
  const related = [1, 2, 3]
    .map(k => catProducts[(ci + k) % catProducts.length])
    .filter((x, i, arr) => x && x.slug !== p.slug && arr.findIndex(y => y.slug === x.slug) === i)
  const guide = POSTS.find(x => x.slug === (PRODUCT_GUIDE[p.slug] || CATEGORY_GUIDE[p.cat]))
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
          {d && (
            <>
              <h2 className="pdp-h2">Specifications</h2>
              <ul className="pdp-specs">{d.specs.map((s, i) => <li key={i}>{s}</li>)}</ul>
              <p className="pdp-use">{d.use}</p>
            </>
          )}
          {cfg && (
            <div className="note-picker">
              <div className="note-picker-head">
                <strong>Choose your notes</strong>
                <span>{mix.length} of {cfg.max} selected</span>
              </div>
              <div className="note-chips" role="group" aria-label="Choose the notes in this set">
                {SET_NOTE_OPTIONS.map(note => {
                  const on = mix.includes(note)
                  const full = !on && mix.length >= cfg.max
                  return (
                    <button key={note} type="button" className={'note-chip' + (on ? ' on' : '')}
                      aria-pressed={on} disabled={full} onClick={() => toggleNote(note)}>{note}</button>
                  )
                })}
              </div>
              <p className="note-picker-hint">Pick up to {cfg.max}. We balance the quantities across your choices and confirm on WhatsApp — the price is unchanged.</p>
            </div>
          )}
          <div className="pdp-cta">
            <QtyStepper qty={qty} setQty={setQty} label={p.name} />
            <button type="button" className="btn btn-lg" onClick={() => { addToCart(p.slug, qty, mix); setAdded(true); setQty(1); setTimeout(() => setAdded(false), 1600); openCartDrawer() }}>{added ? 'Added to cart ✓' : 'Add to cart'}</button>
            <Link className="btn btn-lg btn-ghost" to="/cart/">View cart</Link>
          </div>
          <ul className="pdp-meta">
            <li>Dispatched from Sydney in 1 business day</li>
            <li>Free shipping Australia-wide over ${SITE.freeShipOver} AUD</li>
            <li>{SITE.cryptoDiscount}% discount on crypto payments</li>
            <li>Minimum order ${SITE.minOrder} AUD</li>
          </ul>
          <p className="compliance">For film, TV, photography, training and event use only. These props carry no monetary value and must never be used as genuine money. All notes are reduced-scale and clearly marked as props in line with RBA reproduction guidelines. See our <Link to="/terms/">terms</Link>.</p>
        </div>
      </div>
      {d && (
        <section className="section-tight pdp-faq">
          <h2>{d.faq.q}</h2>
          <p>{d.faq.a}</p>
        </section>
      )}
      {related.length > 0 && (
        <section className="section-tight">
          <h2>You may also like</h2>
          <div className="pgrid">
            {related.map(r => <ProductCard key={r.slug} p={r} />)}
          </div>
        </section>
      )}
      <p>Planning a shoot? {guide && <>Read <Link to={'/blog/' + guide.slug + '/'}>{guide.title}</Link>, </>}browse <Link to={'/shop/' + cat.slug + '/'}>all {cat.name.toLowerCase()}</Link>, or ask about <Link to="/wholesale/">wholesale pricing</Link>.</p>
    </main>
  )
}
