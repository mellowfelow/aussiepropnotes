import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { REVIEW_STATS, REVIEWS } from '../data/reviews.js'

function StarBox({ rating, size = 'sm' }) {
  return (
    <div className={'tp-stars tp-stars-' + size} aria-label={rating + ' out of 5 stars'}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={'tp-star' + (star <= rating ? ' filled' : '')}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.5l7.1-.6z" /></svg>
        </span>
      ))}
    </div>
  )
}

function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
}

const AVATAR_COLORS = ['#0E7C5A', '#1D4E89', '#8A5A0E', '#4B3E8A', '#8A2E4E', '#0E6B72', '#3A3A3A']
function avatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function ReviewsSection() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('slider')
  const [gridLimit, setGridLimit] = useState(6)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [helpfulVotes, setHelpfulVotes] = useState({})
  const [sharedToast, setSharedToast] = useState(false)
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [newReviewSent, setNewReviewSent] = useState(false)
  const [reviewSending, setReviewSending] = useState(false)
  const [itemsPerSlide, setItemsPerSlide] = useState(3)
  const [progress, setProgress] = useState(0)
  const sliderRef = useRef(null)

  const filteredReviews = useMemo(() => {
    return REVIEWS.filter((r) => {
      let matchesFilter = true
      if (activeFilter === '5') matchesFilter = r.rating === 5
      else if (activeFilter === '4') matchesFilter = r.rating === 4
      else if (activeFilter === '3-1') matchesFilter = r.rating <= 3
      else if (['quality', 'delivery', 'film', 'service'].includes(activeFilter)) matchesFilter = r.category === activeFilter

      let matchesSearch = true
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        matchesSearch = r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || (r.product && r.product.toLowerCase().includes(q))
      }
      return matchesFilter && matchesSearch
    })
  }, [activeFilter, searchQuery])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerSlide(1)
      else if (window.innerWidth < 1024) setItemsPerSlide(2)
      else setItemsPerSlide(3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, Math.ceil(filteredReviews.length / itemsPerSlide) - 1)

  useEffect(() => {
    if (viewMode !== 'slider' || isPaused || maxIndex === 0) { setProgress(0); return }
    const duration = 6500, tick = 50
    let elapsed = 0
    const interval = setInterval(() => {
      elapsed += tick
      setProgress(Math.min(100, (elapsed / duration) * 100))
      if (elapsed >= duration) {
        elapsed = 0
        setProgress(0)
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
      }
    }, tick)
    return () => clearInterval(interval)
  }, [viewMode, isPaused, maxIndex, currentIndex])

  useEffect(() => { setCurrentIndex(0); setProgress(0) }, [activeFilter, searchQuery, itemsPerSlide])

  const nextSlide = () => { setProgress(0); setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1)) }
  const prevSlide = () => { setProgress(0); setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1)) }
  const handleHelpful = (id) => setHelpfulVotes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setSharedToast(true)
      setTimeout(() => setSharedToast(false), 2500)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    const form = e.target
    setReviewSending(true)
    try {
      const data = new FormData(form)
      const fields = Object.fromEntries(data.entries())
      await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'review', fields }),
      })
      setNewReviewSent(true)
    } catch {
      setNewReviewSent(true)
    } finally {
      setReviewSending(false)
    }
  }

  const visibleReviews = viewMode === 'slider'
    ? filteredReviews.slice(currentIndex * itemsPerSlide, currentIndex * itemsPerSlide + itemsPerSlide)
    : filteredReviews.slice(0, gridLimit)

  return (
    <section className="section reviews-section" id="reviews">
      <div className="reviews-inner">
        <div className="reviews-head">
          <div className="tp-badge">
            <span className="tp-badge-mark"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.5l7.1-.6z" /></svg></span>
            <strong>Trustpilot</strong><span className="tp-sep">|</span>
            <span className="tp-excellent">Excellent 4.8</span><span className="tp-sep">·</span>
            <span className="tp-muted">{REVIEW_STATS.totalReviews} Verified Reviews</span>
          </div>
          <h2>What Australian Film Crews &amp; Creators Say</h2>
          <p className="reviews-sub">Authentic customer reviews from our production supplier catalogue. Rated {REVIEW_STATS.rating} out of 5 across {REVIEW_STATS.totalReviews}+ verified prop orders dispatched Australia-wide.</p>
        </div>

        <div className="reviews-scoreboard">
          <div className="reviews-score-col">
            <div className="reviews-score-row">
              <span className="tp-label">Overall TrustScore</span>
              <span className="tp-verified-pill"><CheckIcon /> Verified</span>
            </div>
            <div className="reviews-score-big">
              <span className="reviews-score-num">{REVIEW_STATS.rating}</span>
              <div>
                <StarBox rating={5} size="md" />
                <p className="reviews-score-label"><span className="tp-excellent">{REVIEW_STATS.ratingText}</span> · {REVIEW_STATS.totalReviews} reviews</p>
              </div>
            </div>
            <p className="reviews-score-note">94% of Australian production crews, directors and event coordinators rate Aussie Prop Notes 4 or 5 stars.</p>
            <div className="reviews-score-actions">
              <button type="button" className="btn btn-sm" onClick={() => setShowWriteModal(true)}>Write a review</button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={handleShare}>Share</button>
            </div>
            {sharedToast && <p className="reviews-toast">Link copied to clipboard!</p>}
          </div>

          <div className="reviews-breakdown-col">
            <div className="reviews-breakdown-head"><span className="tp-label">Rating Breakdown</span><span className="tp-muted-sm">Click bar to filter</span></div>
            {[5, 4, 3, 2, 1].map((stars) => {
              const data = REVIEW_STATS.breakdown[stars]
              const isSelected = activeFilter === String(stars) || (stars <= 3 && activeFilter === '3-1')
              return (
                <button key={stars} type="button" className={'reviews-bar-row' + (isSelected ? ' active' : '')} onClick={() => setActiveFilter(stars >= 4 ? String(stars) : '3-1')}>
                  <span className="reviews-bar-stars">{stars}★</span>
                  <span className="reviews-bar-track"><span className="reviews-bar-fill" style={{ width: data.percentage + '%' }} /></span>
                  <span className="reviews-bar-pct">{data.percentage}%</span>
                  <span className="reviews-bar-count">({data.count})</span>
                </button>
              )
            })}
          </div>

          <div className="reviews-trust-col">
            <div className="reviews-trust-item"><strong>RBA Compliant &amp; Legal</strong><span>Reproduction props meeting Reserve Bank of Australia scale guidelines.</span></div>
            <div className="reviews-trust-item"><strong>Sydney Stock &amp; Dispatch</strong><span>Dispatched same day / 1 business day Australia-wide with tracking.</span></div>
            <div className="reviews-trust-item"><strong>Fast Customer Support</strong><span>Dedicated WhatsApp and email support for urgent production call times.</span></div>
          </div>
        </div>

        <div className="reviews-controls">
          <div className="reviews-search">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search reviews (e.g. camera, stack, 4k, shipping, crypto)..." />
            {searchQuery && <button type="button" className="reviews-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">×</button>}
          </div>
          <div className="reviews-view-toggle">
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setViewMode(viewMode === 'slider' ? 'grid' : 'slider')}>{viewMode === 'slider' ? 'Grid view' : 'Slider view'}</button>
            {viewMode === 'slider' && maxIndex > 0 && (
              <div className="reviews-slider-nav">
                <button type="button" onClick={prevSlide} aria-label="Previous slide">‹</button>
                <span>{currentIndex + 1} / {maxIndex + 1}</span>
                <button type="button" onClick={nextSlide} aria-label="Next slide">›</button>
              </div>
            )}
          </div>
        </div>

        <div className="reviews-pills">
          {[
            { id: 'all', label: `All Reviews (${REVIEW_STATS.totalReviews})` },
            { id: '5', label: `5 Stars (${REVIEW_STATS.breakdown[5].count})` },
            { id: '4', label: `4 Stars (${REVIEW_STATS.breakdown[4].count})` },
            { id: '3-1', label: `3-1 Stars (${REVIEW_STATS.breakdown[3].count + REVIEW_STATS.breakdown[2].count + REVIEW_STATS.breakdown[1].count})` },
            { id: 'quality', label: 'Product Realism' },
            { id: 'delivery', label: 'Sydney Dispatch' },
            { id: 'film', label: 'Film & TV Crew' },
            { id: 'service', label: 'Customer Service' },
          ].map((tab) => (
            <button key={tab.id} type="button" className={'reviews-pill' + (activeFilter === tab.id ? ' active' : '')} onClick={() => setActiveFilter(tab.id)}>{tab.label}</button>
          ))}
        </div>

        {viewMode === 'slider' && maxIndex > 0 && (
          <div className="reviews-progress"><span style={{ width: progress + '%' }} /></div>
        )}

        <div ref={sliderRef} className="reviews-grid-wrap" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          {filteredReviews.length === 0 ? (
            <div className="reviews-empty">
              <p>No reviews found matching &ldquo;{searchQuery}&rdquo;.</p>
              <button type="button" className="reviews-clear-link" onClick={() => { setSearchQuery(''); setActiveFilter('all') }}>Clear filters and view all reviews</button>
            </div>
          ) : (
            <div className="reviews-grid">
              {visibleReviews.map((rev) => {
                const extraVotes = helpfulVotes[rev.id] || 0
                return (
                  <article key={rev.id} className="review-card">
                    <div className="review-card-head">
                      <div className="review-avatar" style={{ background: avatarColor(rev.author) }}>{rev.author.slice(0, 2)}</div>
                      <div className="review-card-who">
                        <div className="review-card-name"><strong>{rev.author}</strong><span className="tp-sep">·</span><span className="review-card-loc">{rev.location}</span></div>
                        {rev.role && <p className="review-card-role">{rev.role}</p>}
                      </div>
                    </div>
                    <div className="review-card-meta">
                      <div className="review-card-rating"><StarBox rating={rev.rating} size="sm" /><span className="tp-verified-pill sm"><CheckIcon /> Verified Buyer</span></div>
                      <span className="review-card-date">{rev.date}</span>
                    </div>
                    <h3 className="review-card-title">{rev.title}</h3>
                    <p className="review-card-body">&ldquo;{rev.body}&rdquo;</p>
                    {rev.product && (
                      <p className="review-card-product"><span>Item:</span> <Link to={'/product/' + rev.productSlug + '/'}>{rev.product}</Link></p>
                    )}
                    {rev.companyReply && (
                      <div className="review-card-reply">
                        <div className="review-card-reply-head"><span>{rev.companyReply.author}</span><span className="review-card-date">{rev.companyReply.date}</span></div>
                        <p>{rev.companyReply.text}</p>
                      </div>
                    )}
                    <div className="review-card-foot">
                      <span>Date of experience: {rev.isoDate}</span>
                      <button type="button" onClick={() => handleHelpful(rev.id)}>Helpful ({rev.helpfulCount + extraVotes})</button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {viewMode === 'grid' && filteredReviews.length > 6 && (
            <p className="center reviews-loadmore">
              {gridLimit < filteredReviews.length ? (
                <button type="button" className="btn btn-sm" onClick={() => setGridLimit((prev) => Math.min(filteredReviews.length, prev + 6))}>Load More Reviews ({gridLimit} of {filteredReviews.length})</button>
              ) : (
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setGridLimit(6)}>Show Less</button>
              )}
            </p>
          )}

          {viewMode === 'slider' && maxIndex > 0 && (
            <div className="reviews-dots">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button key={idx} type="button" className={'reviews-dot' + (currentIndex === idx ? ' active' : '')} onClick={() => { setProgress(0); setCurrentIndex(idx) }} aria-label={'Slide ' + (idx + 1)} />
              ))}
            </div>
          )}
        </div>

        <div className="reviews-guarantee">
          <span><strong>Verified Reviews</strong> · Showing real feedback from film productions, photography studios &amp; events.</span>
          <Link to="/shop/" className="reviews-guarantee-link">Browse Australian Prop Money →</Link>
        </div>
      </div>

      {showWriteModal && (
        <div className="modal-overlay" onClick={() => { setShowWriteModal(false); setNewReviewSent(false) }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => { setShowWriteModal(false); setNewReviewSent(false) }} aria-label="Close">×</button>
            {newReviewSent ? (
              <div className="reviews-modal-success">
                <div className="reviews-modal-check"><CheckIcon /></div>
                <h3>Review submitted!</h3>
                <p>Thank you for your feedback — our team will read it and get back to you if needed.</p>
                <button type="button" className="btn" onClick={() => { setShowWriteModal(false); setNewReviewSent(false) }}>Close</button>
              </div>
            ) : (
              <div>
                <h3>Write a review</h3>
                <p className="reviews-modal-sub">Share your feedback on camera realism, paper stock texture, Sydney dispatch speed, or customer support.</p>
                <form onSubmit={submitReview} className="reviews-modal-form">
                  <label>Your name or production team<input type="text" name="Name" required placeholder="e.g. Liam M. · Film Art Department" /></label>
                  <label>Email<input type="email" name="Email" required placeholder="you@example.com" /></label>
                  <label>Australian city / location<input type="text" name="Location" required placeholder="e.g. Sydney NSW, Melbourne VIC" /></label>
                  <label>Rating
                    <select name="Rating" defaultValue="5">
                      {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} stars</option>)}
                    </select>
                  </label>
                  <label>Review headline<input type="text" name="Headline" required placeholder="e.g. Flawless 4K camera read and rapid Sydney dispatch" /></label>
                  <label>Your review<textarea name="Message" rows={4} required placeholder="Describe the print detail, paper feel under studio lighting, packaging and shipping experience..." /></label>
                  <button type="submit" className="btn" disabled={reviewSending}>{reviewSending ? 'Sending…' : 'Submit review'}</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
