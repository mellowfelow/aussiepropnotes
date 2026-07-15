import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { PRODUCTS, CATEGORIES } from '../data/site.js'
import { ProductCard, Breadcrumbs } from '../components/ui.jsx'

export default function Shop() {
  const { cat } = useParams()
  const category = cat ? CATEGORIES.find(c => c.slug === cat) : null
  const items = category ? PRODUCTS.filter(p => p.cat === category.slug) : PRODUCTS
  return (
    <main className="section">
      <Breadcrumbs trail={category ? [['Shop', '/shop/'], [category.name, null]] : [['Shop', null]]} />
      <h1>{category ? category.name : 'Buy Prop Money Australia — Full Product Range'}</h1>
      <p className="lead">{category ? category.desc : 'Every prop note, money stack and money prop we make — all RBA-guideline compliant, all dispatched from Sydney within one business day. Minimum order $250 AUD, free shipping over $500 AUD.'}</p>
      <div className="chip-row">
        <Link to="/shop/" className={'chip' + (!category ? ' on' : '')}>All</Link>
        {CATEGORIES.map(c => <Link key={c.slug} to={'/shop/' + c.slug + '/'} className={'chip' + (category && category.slug === c.slug ? ' on' : '')}>{c.name}</Link>)}
      </div>
      <div className="pgrid">
        {items.map(p => <ProductCard key={p.slug} p={p} />)}
      </div>
      <section className="shop-links">
        <p>Not sure where to start? Read our <Link to="/blog/australian-prop-money-buyers-guide-film-tv/">film &amp; TV buyer's guide</Link>, check <Link to="/blog/is-prop-money-legal-australia/">the Australian legal rules</Link>, or <Link to="/wholesale/">request wholesale pricing</Link> for bulk orders.</p>
      </section>
    </main>
  )
}
