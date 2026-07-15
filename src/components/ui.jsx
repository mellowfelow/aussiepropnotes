import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SITE, CATEGORIES } from '../data/site.js'

// Entity-encoded email renderer (no plaintext emails in DOM/HTML)
export function Email({ addr, className }) {
  const enc = addr.replace(/@/g, '&#64;').replace(/\./g, '&#46;')
  return <a className={className} href={'mailto:' + addr.replace('@','%40')} dangerouslySetInnerHTML={{ __html: enc }} />
}

export const fmt = (n) => '$' + n.toLocaleString('en-AU') + ' AUD'

// ── Cart store (localStorage 'apn-cart') ─────────────────────────
export function readCart() {
  try { return JSON.parse(localStorage.getItem('apn-cart') || '[]') } catch { return [] }
}
export function writeCart(items) {
  localStorage.setItem('apn-cart', JSON.stringify(items))
  window.dispatchEvent(new Event('apn-cart-change'))
}
export function addToCart(slug, qty = 1) {
  const c = readCart(); const f = c.find(i => i.slug === slug)
  if (f) f.qty += qty; else c.push({ slug, qty })
  writeCart(c)
}
export function removeFromCart(slug) {
  writeCart(readCart().filter(i => i.slug !== slug))
}
export function clearCart() { writeCart([]) }
export function cartCount() { return readCart().reduce((a, i) => a + i.qty, 0) }

export function useCartCount() {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(cartCount())
    const h = () => setN(cartCount())
    window.addEventListener('apn-cart-change', h)
    return () => window.removeEventListener('apn-cart-change', h)
  }, [])
  return n
}

// ── Announcement bar ─────────────────────────────────────────────
const SLIDES = [
  '10% off every crypto payment — applied automatically',
  'Minimum order $250 AUD',
  'Free shipping Australia-wide over $500 AUD',
  'Questions? Chat with us on WhatsApp',
]
export function AnnouncementBar() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % SLIDES.length), 4000); return () => clearInterval(t) }, [])
  return <div className="annbar" role="status">{SLIDES[i]}</div>
}

// ── Nav ──────────────────────────────────────────────────────────
export function Nav() {
  const [open, setOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const count = useCartCount()
  const loc = useLocation()
  useEffect(() => { setOpen(false); setShopOpen(false) }, [loc.pathname])
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand" aria-label="Aussie Prop Notes home">
          <img src="/images/logo.svg" alt="Aussie Prop Notes logo" width="40" height="40" loading="eager" />
          <span>Aussie<b>PropNotes</b></span>
        </Link>
        <nav className={'nav-links' + (open ? ' open' : '')} aria-label="Main navigation">
          <Link to="/">Home</Link>
          <div className="nav-drop" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
            <Link to="/shop/" aria-expanded={shopOpen}>Shop ▾</Link>
            <div className={'mega' + (shopOpen ? ' show' : '')}>
              {CATEGORIES.map(c => <Link key={c.slug} to={'/shop/' + c.slug + '/'}>{c.name}</Link>)}
            </div>
          </div>
          <Link to="/blog/">Blog</Link>
          <Link to="/about/">About</Link>
          <Link to="/wholesale/">Wholesale</Link>
        </nav>
        <div className="nav-actions">
          <Link to="/cart/" className="cart-btn" aria-label={'Cart, ' + count + ' items'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <button className="burger" type="button" aria-label="Toggle menu" onClick={() => setOpen(v => !v)}>
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </header>
  )
}

// ── Trust bar ────────────────────────────────────────────────────
export function TrustBar() {
  const items = [
    ['🚚', 'Fast nationwide shipping', 'Dispatched from Sydney in 1 business day'],
    ['🎬', 'Camera-ready quality', 'Offset printed for 4K & 8K sensors'],
    ['💬', 'Real human support', 'WhatsApp and email, 7 days'],
    ['🔒', 'Flexible payment', 'Crypto (10% off), bank transfer, PayID'],
  ]
  return (
    <section className="trustbar" aria-label="Why buy from us">
      {items.map(([ic, t, s]) => (
        <div key={t} className="trust-item">
          <span className="trust-ic" aria-hidden="true">{ic}</span>
          <div><strong>{t}</strong><small>{s}</small></div>
        </div>
      ))}
    </section>
  )
}

// ── Product card ─────────────────────────────────────────────────
export function ProductCard({ p }) {
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  return (
    <article className="pcard">
      {p.badge && <span className={'badge badge-' + p.badge.toLowerCase().replace(/ /g, '-')}>{p.badge}</span>}
      <Link to={'/product/' + p.slug + '/'} className="pcard-img">
        <img src={'/images/' + p.slug + '.webp'} alt={p.name + ' — Australian prop money product'} width="400" height="400" loading="lazy" />
      </Link>
      <div className="pcard-body">
        <h3><Link to={'/product/' + p.slug + '/'}>{p.name}</Link></h3>
        <p>{p.short}</p>
        <div className="pcard-foot">
          <span className="price">{fmt(p.price)}</span>
          <QtyStepper qty={qty} setQty={setQty} label={p.name} />
        </div>
        <button type="button" className="btn btn-sm btn-full" onClick={() => { addToCart(p.slug, qty); setAdded(true); setQty(1); setTimeout(() => setAdded(false), 1600) }}>
          {added ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </article>
  )
}

// ── Quantity stepper (shared by cards, PDP and cart) ─────────────
export function QtyStepper({ qty, setQty, label, min = 1 }) {
  return (
    <div className="qty" role="group" aria-label={'Quantity for ' + label}>
      <button type="button" aria-label={'Decrease quantity of ' + label} onClick={() => setQty(Math.max(min, qty - 1))} disabled={qty <= min}>−</button>
      <input type="number" inputMode="numeric" min={min} max="999" value={qty} aria-label={'Quantity of ' + label}
        onChange={e => { const v = parseInt(e.target.value, 10); setQty(isNaN(v) ? min : Math.min(999, Math.max(min, v))) }} />
      <button type="button" aria-label={'Increase quantity of ' + label} onClick={() => setQty(Math.min(999, qty + 1))}>+</button>
    </div>
  )
}

// ── Footer ───────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <strong>Aussie Prop Notes</strong>
          <p>Camera-ready prop money for film, TV, photography and events. Sydney-founded, shipping Australia-wide since {SITE.founded}.</p>
          <p><Email addr={SITE.email} /> · <a href={'https://wa.me/' + SITE.whatsapp} rel="noopener">WhatsApp</a></p>
        </div>
        <div className="footer-cols">
          <div>
            <strong>Shop</strong>
            {CATEGORIES.map(c => <Link key={c.slug} to={'/shop/' + c.slug + '/'}>{c.name}</Link>)}
          </div>
          <div>
            <strong>Company</strong>
            <Link to="/about/">About</Link>
            <Link to="/blog/">Blog</Link>
            <Link to="/wholesale/">Wholesale</Link>
            <Link to="/contact/">Contact</Link>
            <Link to="/faq/">FAQ</Link>
          </div>
          <div>
            <strong>Legal</strong>
            <Link to="/shipping/">Shipping</Link>
            <Link to="/refund/">Refund Policy</Link>
            <Link to="/privacy/">Privacy</Link>
            <Link to="/terms/">Terms</Link>
          </div>
        </div>
      </div>
      <div className="footer-bar">
        <span>© {SITE.founded}–2026 Aussie Prop Notes. All prop notes are clearly marked, reduced-scale reproductions for film, photography and event use only. Not legal tender.</span>
      </div>
      <a className="wa-float" href={'https://wa.me/' + SITE.whatsapp} aria-label="Chat on WhatsApp" rel="noopener">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35z"/><path d="M12 2a10 10 0 0 0-8.53 15.2L2 22l4.9-1.42A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-2.9.84.85-2.83-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>
      </a>
    </footer>
  )
}

export function Breadcrumbs({ trail }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {trail.map(([label, to], i) => (
        <span key={i}> / {to ? <Link to={to}>{label}</Link> : <span aria-current="page">{label}</span>}</span>
      ))}
    </nav>
  )
}
