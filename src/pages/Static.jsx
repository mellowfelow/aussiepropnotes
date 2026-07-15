import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SITE, FAQS, PRODUCTS } from '../data/site.js'
import { Breadcrumbs, Email, QtyStepper, fmt, readCart, writeCart, removeFromCart, clearCart } from '../components/ui.jsx'
import WebForm from '../components/WebForm.jsx'

export function About() {
  return (
    <main className="section article">
      <Breadcrumbs trail={[['About', null]]} />
      <h1>About Aussie Prop Notes — Australia's Prop Money Specialist</h1>
      <p className="lead">Aussie Prop Notes is a Sydney-founded supplier of camera-ready prop money, serving film productions, photographers, event companies and content creators across Australia since {SITE.founded}.</p>
      <h2>Our story</h2>
      <p>Aussie Prop Notes was founded in Sydney in {SITE.founded} to solve a problem every Australian production knew too well: prop money either came from overseas marketplaces with unpredictable quality and slow shipping, or it simply didn't hold up on camera. We built a local alternative — offset-printed, matte-finished Australian-style prop notes designed for modern 4K and 8K sensors, stocked in Sydney and dispatched within one business day.</p>
      <h2>Milestones</h2>
      <ul className="timeline">
        <li><strong>{SITE.founded}</strong> — Founded in Sydney; first full-print AUD prop note line launched.</li>
        <li><strong>2023</strong> — Began collaborations with leading Australian film productions and music producers.</li>
        <li><strong>2024</strong> — Supplied countless content creators and photographers nationwide; expanded into custom branded notes and wholesale supply.</li>
        <li><strong>2026</strong> — Full product range across film, photography, events, novelty and custom printing.</li>
      </ul>
      <h2>What makes us different</h2>
      <div className="diff-grid">
        <div><strong>Reliable shipping</strong><p>Stocked in Sydney, dispatched in one business day, tracked nationwide. No overseas wait, no customs surprises.</p></div>
        <div><strong>Top-notch quality</strong><p>Offset printing and matte stock engineered for professional cameras — not inkjet novelty prints.</p></div>
        <div><strong>Client-first flexibility</strong><p>We work to client preferences: custom denominations, aging levels, branded notes and production-specific requests.</p></div>
        <div><strong>Compliance you can cite</strong><p>Every note follows RBA reproduction guidelines: reduced scale, clear prop markings, no replicated security features.</p></div>
      </div>
      <h2>Who we supply</h2>
      <p>Feature films and TV productions. Music video producers. Commercial and lifestyle photographers. Wedding and corporate event companies. Social content creators. Training organisations teaching cash handling. If your work needs money on camera or in hand, we supply it — retail from ${SITE.minOrder} AUD, and <Link to="/wholesale/">wholesale</Link> for trade volumes.</p>
      <h2>Where we ship</h2>
      <p>Everywhere in Australia. Free shipping on orders over ${SITE.freeShipOver} AUD, flat ${SITE.flatShip} AUD under that. Most metro orders arrive within 1–3 business days of dispatch.</p>
      <h2>Get in touch</h2>
      <p>Questions, custom requests or trade enquiries: <Email addr={SITE.email} />, <a href={'https://wa.me/' + SITE.whatsapp} rel="noopener">WhatsApp us</a>, or use the <Link to="/contact/">contact page</Link>.</p>
    </main>
  )
}

export function Contact() {
  return (
    <main className="section narrow">
      <Breadcrumbs trail={[['Contact', null]]} />
      <h1>Contact Aussie Prop Notes</h1>
      <p className="lead">Questions about products, orders or anything else — send a message and we reply within one business day. Prefer chat? <a href={'https://wa.me/' + SITE.whatsapp} rel="noopener">Message us on WhatsApp</a>.</p>
      <WebForm subject="New Contact Message — Aussie Prop Notes" thankYou="/thank-you-contact/" submitLabel="Send message">
        <label>Your name<input type="text" name="name" required autoComplete="name" /></label>
        <label>Email<input type="email" name="email" required autoComplete="email" /></label>
        <label>Message<textarea name="message" rows="6" required /></label>
      </WebForm>
      <p>You can also email <Email addr={SITE.email} /> directly.</p>
    </main>
  )
}

export function Wholesale() {
  return (
    <main className="section">
      <Breadcrumbs trail={[['Wholesale', null]]} />
      <h1>Prop Money Wholesale Australia — Trade &amp; Bulk Orders</h1>
      <p className="lead">Bulk prop money for film studios, event companies, photographers and training providers. Tiered trade pricing, priority dispatch from Sydney, and a dedicated contact for repeat orders.</p>
      <div className="tier-grid">
        <div className="tier"><strong>Tier 1</strong><span>$1,000–$2,499 AUD</span><b>10% off retail</b></div>
        <div className="tier"><strong>Tier 2</strong><span>$2,500–$4,999 AUD</span><b>15% off retail</b></div>
        <div className="tier"><strong>Tier 3</strong><span>$5,000+ AUD</span><b>20% off + priority dispatch</b></div>
      </div>
      <h2>How wholesale works</h2>
      <p>Tell us what you need below — product types, quantities and your deadline. We reply within one business day with trade pricing and stock confirmation. Crypto payments still earn the {SITE.cryptoDiscount}% discount on top of trade rates. Custom branded runs are quoted separately with a printed proof before production.</p>
      <WebForm subject="New Wholesale Enquiry — Aussie Prop Notes" thankYou="/thank-you-wholesale/" submitLabel="Request trade pricing">
        <label>Company / production name<input type="text" name="company" required /></label>
        <label>Contact name<input type="text" name="name" required autoComplete="name" /></label>
        <label>Email<input type="email" name="email" required autoComplete="email" /></label>
        <label>Phone / WhatsApp<input type="tel" name="phone" autoComplete="tel" /></label>
        <label>What do you need? (products, quantities, deadline)<textarea name="message" rows="6" required /></label>
      </WebForm>
      <p>Browse the <Link to="/shop/">full range</Link> first, or read <Link to="/blog/australian-prop-money-buyers-guide-film-tv/">the production buyer's guide</Link>.</p>
    </main>
  )
}

export function Faq() {
  return (
    <main className="section narrow">
      <Breadcrumbs trail={[['FAQ', null]]} />
      <h1>Prop Money Australia — Frequently Asked Questions</h1>
      <p className="lead">Everything buyers ask us about prop money in Australia: legality, quality, ordering, shipping and payment.</p>
      <div className="faq-list">
        {FAQS.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
      </div>
      <p>Still unsure? <Link to="/contact/">Contact us</Link> or read <Link to="/blog/is-prop-money-legal-australia/">the complete legal guide</Link>. Ready to buy? <Link to="/shop/">Shop the range</Link>.</p>
    </main>
  )
}

export function Cart() {
  const [items, setItems] = useState([])
  const [crypto, setCrypto] = useState(false)
  const [undo, setUndo] = useState(null)
  useEffect(() => { setItems(readCart()) }, [])
  function update(slug, qty) {
    const next = items.map(i => i.slug === slug ? { ...i, qty } : i).filter(i => i.qty > 0)
    setItems(next); writeCart(next)
  }
  function remove(slug) {
    const gone = items.find(i => i.slug === slug)
    const next = items.filter(i => i.slug !== slug)
    setItems(next); removeFromCart(slug); setUndo(gone)
  }
  function undoRemove() {
    const next = [...items, undo]; setItems(next); writeCart(next); setUndo(null)
  }
  function emptyCart() {
    if (typeof window !== 'undefined' && !window.confirm('Remove all items from your cart?')) return
    setItems([]); clearCart(); setUndo(null)
  }
  const rows = items.map(i => ({ ...i, p: PRODUCTS.find(p => p.slug === i.slug) })).filter(r => r.p)
  const subtotal = rows.reduce((a, r) => a + r.p.price * r.qty, 0)
  const discount = crypto ? Math.round(subtotal * SITE.cryptoDiscount) / 100 : 0
  const afterDisc = subtotal - discount
  const shipping = afterDisc >= SITE.freeShipOver ? 0 : (rows.length ? SITE.flatShip : 0)
  const total = afterDisc + shipping
  const underMin = rows.length > 0 && afterDisc < SITE.minOrder
  return (
    <main className="section narrow">
      <Breadcrumbs trail={[['Cart', null]]} />
      <h1>Your Cart</h1>
      {undo && (
        <p className="undo-bar" role="status">
          Removed {undo.qty} × {(PRODUCTS.find(p => p.slug === undo.slug) || {}).name}.
          <button type="button" className="linkbtn" onClick={undoRemove}>Undo</button>
        </p>
      )}
      {rows.length === 0 ? (
        <p className="lead">Your cart is empty. <Link to="/shop/">Browse the prop money range</Link> to get started.</p>
      ) : (
        <>
          <div className="cart-rows">
            {rows.map(r => (
              <div key={r.slug} className="cart-row">
                <img src={'/images/' + r.slug + '.webp'} alt={r.p.name} width="72" height="72" loading="lazy" />
                <div className="cart-row-info">
                  <Link to={'/product/' + r.slug + '/'}>{r.p.name}</Link>
                  <span>{fmt(r.p.price)} each</span>
                </div>
                <QtyStepper qty={r.qty} setQty={(q) => update(r.slug, q)} label={r.p.name} />
                <strong>{fmt(r.p.price * r.qty)}</strong>
                <button type="button" className="rm-btn" aria-label={'Remove ' + r.p.name + ' from cart'} title="Remove" onClick={() => remove(r.slug)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            ))}
          </div>
          <p className="cart-tools"><button type="button" className="linkbtn" onClick={emptyCart}>Empty cart</button> · <Link to="/shop/">Add more items</Link></p>
          <label className="crypto-toggle"><input type="checkbox" checked={crypto} onChange={e => setCrypto(e.target.checked)} /> Paying with crypto (BTC / USDT) — save {SITE.cryptoDiscount}%</label>
          <div className="totals">
            <div><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            {crypto && <div className="disc"><span>Crypto discount ({SITE.cryptoDiscount}%)</span><span>−{fmt(discount)}</span></div>}
            <div><span>Shipping</span><span>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
            {shipping > 0 && <p className="ship-hint">Add {fmt(SITE.freeShipOver - afterDisc)} more for free shipping.</p>}
            <div className="grand"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
          {underMin && <p className="form-err" role="alert">Minimum order is {fmt(SITE.minOrder)}. Add {fmt(SITE.minOrder - afterDisc)} more to check out.</p>}
          <div className="hero-cta">
            <Link to="/order/" className={'btn btn-lg' + (underMin ? ' disabled' : '')} aria-disabled={underMin}>Place order</Link>
            <Link to="/shop/" className="btn btn-lg btn-ghost">Keep shopping</Link>
          </div>
        </>
      )}
    </main>
  )
}

export function Order() {
  const [summary, setSummary] = useState('')
  useEffect(() => {
    const rows = readCart().map(i => ({ ...i, p: PRODUCTS.find(p => p.slug === i.slug) })).filter(r => r.p)
    const lines = rows.map(r => `${r.qty} × ${r.p.name} — ${fmt(r.p.price * r.qty)}`)
    const subtotal = rows.reduce((a, r) => a + r.p.price * r.qty, 0)
    setSummary(lines.length ? lines.join('\n') + `\nSubtotal: ${fmt(subtotal)}` : '')
  }, [])
  const waMsg = encodeURIComponent('Hi Aussie Prop Notes, I would like to place an order:\n' + summary)
  return (
    <main className="section narrow">
      <Breadcrumbs trail={[['Cart', '/cart/'], ['Order', null]]} />
      <h1>Place Your Order</h1>
      <p className="lead">Two ways to order: send the order form below, or message us straight on WhatsApp with your cart attached. Either way we confirm stock and payment details within one business day. Payment by crypto (BTC / USDT, {SITE.cryptoDiscount}% off), bank transfer or PayID.</p>
      <a className="btn btn-lg btn-wa" href={'https://wa.me/' + SITE.whatsapp + '?text=' + waMsg} rel="noopener">Order via WhatsApp</a>
      <div className="or-div"><span>or use the order form</span></div>
      <WebForm subject="New Order — Aussie Prop Notes" thankYou="/thank-you-order/" submitLabel="Send order">
        <label>Your name<input type="text" name="name" required autoComplete="name" /></label>
        <label>Email<input type="email" name="email" required autoComplete="email" /></label>
        <label>Phone / WhatsApp<input type="tel" name="phone" autoComplete="tel" /></label>
        <label>Delivery address<textarea name="address" rows="3" required autoComplete="street-address" /></label>
        <label>Preferred payment
          <select name="payment" required defaultValue="">
            <option value="" disabled>Choose one</option>
            <option>Crypto — BTC / USDT (10% off)</option>
            <option>Bank transfer</option>
            <option>PayID</option>
          </select>
        </label>
        <label>Your order<textarea name="order" rows="6" required value={summary} onChange={e => setSummary(e.target.value)} /></label>
      </WebForm>
    </main>
  )
}

export function Shipping() {
  return (
    <main className="section narrow article">
      <Breadcrumbs trail={[['Shipping', null]]} />
      <h1>Shipping — Fast Prop Money Delivery Australia-Wide</h1>
      <p className="lead">Every order is packed and dispatched from Sydney within one business day, with tracking on every parcel.</p>
      <h2>Rates and thresholds</h2>
      <p>Orders over ${SITE.freeShipOver} AUD ship free anywhere in Australia. Orders under that threshold ship for a flat ${SITE.flatShip} AUD. The minimum order value is ${SITE.minOrder} AUD.</p>
      <h2>Delivery times</h2>
      <p>Sydney, Melbourne, Brisbane and other metro areas typically receive orders in 1–3 business days after dispatch. Regional and remote addresses usually take 3–6 business days. Need it faster for a shoot? Mention your deadline in the order notes or on <a href={'https://wa.me/' + SITE.whatsapp} rel="noopener">WhatsApp</a> and we'll quote express options.</p>
      <h2>Packaging</h2>
      <p>Notes ship flat-packed and board-stiffened so stacks arrive crisp and camera-ready. Briefcase sets ship fully dressed in protective outer cartons.</p>
      <p>Questions about a delivery? <Link to="/contact/">Contact us</Link> or check the <Link to="/faq/">FAQ</Link>.</p>
    </main>
  )
}

export function Refund() {
  return (
    <main className="section narrow article">
      <Breadcrumbs trail={[['Refund Policy', null]]} />
      <h1>Refund &amp; Returns Policy</h1>
      <p className="lead">We stand behind print quality. If something arrives damaged or wrong, we fix it fast.</p>
      <h2>Damaged or incorrect orders</h2>
      <p>Contact us within 7 days of delivery with photos of the issue and we will replace the affected items or refund them — your choice. Replacement stock ships priority at our cost.</p>
      <h2>Change of mind</h2>
      <p>Unopened stock items in original packaging can be returned within 14 days of delivery for a refund of the product price. Return shipping is at the buyer's cost, and refunds are processed within 5 business days of the return arriving.</p>
      <h2>Custom printed notes</h2>
      <p>Custom branded runs are printed to an approved proof and cannot be returned for change of mind. If a custom run arrives with a print defect versus the approved proof, we reprint it free.</p>
      <h2>Australian Consumer Law</h2>
      <p>Nothing in this policy limits your rights under Australian Consumer Law. To start any return, <Link to="/contact/">contact us</Link> with your order details.</p>
    </main>
  )
}

export function Privacy() {
  return (
    <main className="section narrow article">
      <Breadcrumbs trail={[['Privacy', null]]} />
      <h1>Privacy Policy</h1>
      <p className="lead">We collect the minimum information needed to fulfil orders and answer enquiries, and we never sell it.</p>
      <h2>What we collect</h2>
      <p>Order and enquiry forms collect your name, contact details, delivery address and message content. Our cart stores items in your own browser only. We do not run third-party advertising trackers on this site.</p>
      <h2>How we use it</h2>
      <p>Contact and order details are used to fulfil your order, respond to enquiries and provide delivery updates. Form submissions are processed by Web3Forms and delivered to our business email. WhatsApp conversations are handled under WhatsApp's own terms.</p>
      <h2>Retention and access</h2>
      <p>We keep order records as required for Australian tax and consumer-law purposes. You can request a copy of the personal information we hold about you, or ask us to delete it where the law allows, by <Link to="/contact/">contacting us</Link>.</p>
      <h2>Security</h2>
      <p>This site is served entirely over HTTPS. We do not store payment card details — payment is completed by crypto transfer, bank transfer or PayID directly.</p>
    </main>
  )
}

export function Terms() {
  return (
    <main className="section narrow article">
      <Breadcrumbs trail={[['Terms', null]]} />
      <h1>Terms of Service</h1>
      <p className="lead">By purchasing from Aussie Prop Notes you agree to the terms below. They exist to keep the product legal, your production safe, and expectations clear.</p>
      <h2>Permitted use — read this first</h2>
      <p>All products are reduced-scale, clearly marked prop reproductions supplied strictly for film, television, photography, events, training and display. They are not legal tender and must never be used, presented or passed as genuine currency. Attempting to spend prop notes is a criminal offence under the Crimes (Currency) Act 1981, and responsibility for lawful use rests entirely with the buyer.</p>
      <h2>Compliance</h2>
      <p>Our notes are designed to follow Reserve Bank of Australia reproduction guidelines: reduced size relative to genuine notes, clear prop markings, and no reproduction of security features. We refuse orders requesting removal of markings, 1:1 scale, or security-feature replication — no exceptions.</p>
      <h2>Orders and payment</h2>
      <p>Minimum order ${SITE.minOrder} AUD. Payment by cryptocurrency (BTC / USDT — {SITE.cryptoDiscount}% discount), bank transfer or PayID, confirmed before dispatch. Prices are in Australian dollars and include GST where applicable.</p>
      <h2>Liability</h2>
      <p>To the extent permitted by law, our liability is limited to the replacement or refund of the goods purchased. Nothing in these terms excludes rights that cannot be excluded under Australian Consumer Law.</p>
      <p>Questions about these terms? <Link to="/contact/">Contact us</Link>.</p>
    </main>
  )
}

export function ThankYou({ kind }) {
  const copy = {
    contact: ['Message received', 'Thanks for getting in touch — we reply to every message within one business day. If it is urgent, WhatsApp is fastest.'],
    order: ['Order received', 'Thanks for your order! We will confirm stock and send payment details within one business day. Crypto payers: your 10% discount is applied when we invoice.'],
    wholesale: ['Wholesale enquiry received', 'Thanks — our trade team reviews every enquiry personally and replies with pricing within one business day.'],
  }[kind]
  return (
    <main className="section narrow center-page">
      <h1>{copy[0]}</h1>
      <p className="lead">{copy[1]}</p>
      <div className="hero-cta center-cta">
        <Link className="btn btn-lg" to="/shop/">Back to the shop</Link>
        <a className="btn btn-lg btn-ghost" href={'https://wa.me/' + SITE.whatsapp} rel="noopener">WhatsApp us</a>
      </div>
    </main>
  )
}
