import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { POSTS, POST_CLUSTERS, relatedPosts } from '../data/site.js'
import { Breadcrumbs } from '../components/ui.jsx'

const fmtDate = (d) => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

export function BlogIndex() {
  return (
    <main className="section">
      <Breadcrumbs trail={[['Guides', null]]} />
      <h1>Prop Money Guides &amp; Resources for Australia</h1>
      <p className="lead">Straight answers on buying, using and staying compliant with prop money in Australia — written by the team that supplies it to sets nationwide. Grouped by what you're trying to work out.</p>
      {POST_CLUSTERS.map(cl => (
        <section key={cl.slug} className="guide-cluster">
          <h2>{cl.title}</h2>
          <p className="cluster-blurb">{cl.blurb}</p>
          <div className="post-grid">
            {cl.posts.map(s => POSTS.find(p => p.slug === s)).filter(Boolean).map(p => (
              <article key={p.slug} className="post-card">
                <time dateTime={p.modified || p.date}>{fmtDate(p.modified || p.date)}{p.modified ? ' · updated' : ''}</time>
                <h3><Link to={'/blog/' + p.slug + '/'}>{p.title}</Link></h3>
                <p>{p.excerpt}</p>
                <Link className="readmore" to={'/blog/' + p.slug + '/'}>Read the guide →</Link>
              </article>
            ))}
          </div>
        </section>
      ))}
      <p className="shop-links">Ready to order? Browse the <Link to="/shop/">full prop money range</Link>, <Link to="/shop/film-tv-props/">film &amp; TV props</Link>, or <Link to="/wholesale/">wholesale pricing</Link> for bulk orders.</p>
    </main>
  )
}

export function renderInline(text, keyPrefix) {
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
  if (!p) return <main className="section"><h1>Post not found</h1><p><Link to="/blog/">Back to guides</Link></p></main>
  const related = relatedPosts(p.slug, 3)
  return (
    <main className="section article">
      <Breadcrumbs trail={[['Guides', '/blog/'], [p.title, null]]} />
      <h1>{p.title}</h1>
      <time dateTime={p.modified || p.date}>
        {p.modified
          ? `Updated ${fmtDate(p.modified)}`
          : fmtDate(p.date)} · Aussie Prop Notes
      </time>
      {p.body.map(([tag, text], i) => {
        if (tag === 'h2') return <h2 key={i}>{text}</h2>
        if (tag === 'h3') return <h3 key={i}>{text}</h3>
        if (tag === 'ul') return <ul key={i} className="guide-list">{text.map((li, j) => <li key={j}>{renderInline(li, i + '-' + j)}</li>)}</ul>
        return <p key={i}>{renderInline(text, i)}</p>
      })}
      <div className="article-cta">
        <p><strong>Ready to order?</strong> Browse our <Link to="/shop/film-tv-props/">film &amp; TV prop money</Link>, the <Link to="/shop/">full range</Link>, or <Link to="/wholesale/">wholesale pricing</Link> for bulk orders.</p>
      </div>
      {related.length > 0 && (
        <aside className="related-guides">
          <h2>Related guides</h2>
          <ul>
            {related.map(r => (
              <li key={r.slug}><Link to={'/blog/' + r.slug + '/'}>{r.title}</Link></li>
            ))}
          </ul>
        </aside>
      )}
    </main>
  )
}
