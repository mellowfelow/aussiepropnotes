import React from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { PRODUCTS, CATEGORIES } from '../data/site.js'
import { ProductCard, Breadcrumbs } from '../components/ui.jsx'

export default function Shop() {
  const { cat } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = cat ? CATEGORIES.find(c => c.slug === cat) : null
  const q = searchParams.get('q') || ''
  const scoped = category ? PRODUCTS.filter(p => p.cat === category.slug) : PRODUCTS
  const items = q.trim()
    ? scoped.filter(p => (p.name + ' ' + p.short + ' ' + p.desc).toLowerCase().includes(q.trim().toLowerCase()))
    : scoped

  return (
    <main className="section">
      <Breadcrumbs trail={category ? [['Shop', '/shop/'], [category.name, null]] : [['Shop', null]]} />
      <h1>{category ? category.name : 'Buy Prop Money Australia — Full Product Range'}</h1>
      <p className="lead">{category ? category.desc : 'Every prop note, money stack and money prop we make — all RBA-guideline compliant, all dispatched from Sydney within one business day. Minimum order $250 AUD, free shipping over $500 AUD.'}</p>
      <form role="search" className="shop-search" onSubmit={e => e.preventDefault()}>
        <label htmlFor="shop-q" className="sr-only">Search products</label>
        <input id="shop-q" type="search" name="q" placeholder="Search products (e.g. $100, briefcase, aged)"
          defaultValue={q} onChange={e => {
            const v = e.target.value
            setSearchParams(v ? { q: v } : {}, { replace: true })
          }} />
      </form>
      <div className="chip-row">
        <Link to="/shop/" className={'chip' + (!category ? ' on' : '')}>All</Link>
        {CATEGORIES.map(c => <Link key={c.slug} to={'/shop/' + c.slug + '/'} className={'chip' + (category && category.slug === c.slug ? ' on' : '')}>{c.name}</Link>)}
      </div>
      {q.trim() && <p className="search-status">{items.length} result{items.length === 1 ? '' : 's'} for &ldquo;{q}&rdquo;</p>}
      <div className="pgrid">
        {items.map(p => <ProductCard key={p.slug} p={p} />)}
      </div>
      {q.trim() && items.length === 0 && (
        <p>No products matched. <Link to={category ? '/shop/' + category.slug + '/' : '/shop/'}>Clear search</Link> or browse the full range.</p>
      )}
      <section className="shop-links">
        <p>Not sure where to start? Read our <Link to="/blog/australian-prop-money-buyers-guide-film-tv/">film &amp; TV buyer's guide</Link>, check <Link to="/blog/is-prop-money-legal-australia/">the Australian legal rules</Link>, or <Link to="/wholesale/">request wholesale pricing</Link> for bulk orders.</p>
      </section>
    </main>
  )
}
