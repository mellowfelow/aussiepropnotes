import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { POSTS } from '../data/site.js'
import { Breadcrumbs } from '../components/ui.jsx'

export function BlogIndex() {
  return (
    <main className="section">
      <Breadcrumbs trail={[['Blog', null]]} />
      <h1>Prop Money Guides &amp; Resources for Australia</h1>
      <p className="lead">Straight answers on buying, using and staying compliant with prop money in Australia — written by the team that supplies it to sets nationwide.</p>
      <div className="post-grid">
        {POSTS.map(p => (
          <article key={p.slug} className="post-card">
            <time dateTime={p.date}>{new Date(p.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
            <h2><Link to={'/blog/' + p.slug + '/'}>{p.title}</Link></h2>
            <p>{p.excerpt}</p>
            <Link className="readmore" to={'/blog/' + p.slug + '/'}>Read the guide →</Link>
          </article>
        ))}
      </div>
      <p>Ready to order? Browse the <Link to="/shop/">full prop money range</Link> or <Link to="/shop/film-tv-props/">film &amp; TV props</Link>.</p>
    </main>
  )
}

function renderInline(text, keyPrefix) {
  const parts = text.split(/\[([^\]]+)\]\(([^)]+)\)/)
  if (parts.length === 1) return text
  const nodes = []
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) { if (parts[i]) nodes.push(parts[i]); continue }
    const label = parts[i], href = parts[i + 1]
    nodes.push(href.startsWith('/')
      ? <Link key={keyPrefix + '-' + i} to={href}>{label}</Link>
      : <a key={keyPrefix + '-' + i} href={href}>{label}</a>)
    i++
  }
  return nodes
}

export function BlogPost() {
  const { slug } = useParams()
  const p = POSTS.find(x => x.slug === slug)
  if (!p) return <main className="section"><h1>Post not found</h1><p><Link to="/blog/">Back to blog</Link></p></main>
  return (
    <main className="section article">
      <Breadcrumbs trail={[['Blog', '/blog/'], [p.title, null]]} />
      <h1>{p.title}</h1>
      <time dateTime={p.date}>{new Date(p.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} · Aussie Prop Notes</time>
      {p.body.map(([tag, text], i) => {
        if (tag === 'h2') return <h2 key={i}>{text}</h2>
        if (tag === 'h3') return <h3 key={i}>{text}</h3>
        if (tag === 'ul') return <ul key={i} className="guide-list">{text.map((li, j) => <li key={j}>{renderInline(li, i + '-' + j)}</li>)}</ul>
        return <p key={i}>{renderInline(text, i)}</p>
      })}
      <div className="article-cta">
        <p><strong>Ready to order?</strong> Browse our <Link to="/shop/film-tv-props/">film &amp; TV prop money</Link>, the <Link to="/shop/">full range</Link>, or <Link to="/wholesale/">wholesale pricing</Link> for bulk orders.</p>
      </div>
    </main>
  )
}
