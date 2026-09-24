import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const RECENT_ORDERS = [
  { id: 1, buyer: 'Nathan P.', location: 'South Yarra, Melbourne VIC', product: '$100 AUD Full Print Prop Notes', slug: 'aud-100-full-print-prop-notes', timeAgo: '4 mins ago' },
  { id: 2, buyer: 'Art Department', location: 'Fox Studios, Sydney NSW', product: 'Aged & Distressed AUD Prop Notes', slug: 'aged-distressed-aud-prop-notes', timeAgo: '16 mins ago' },
  { id: 3, buyer: 'Sarah J.', location: 'Fortitude Valley, Brisbane QLD', product: 'Money Stack Bundle ($100k Realistic)', slug: 'money-stack-bundle-100k', timeAgo: '28 mins ago' },
  { id: 4, buyer: 'Tyler K.', location: 'Fremantle, Perth WA', product: 'Money Gun + Prop Bills Bundle', slug: 'money-gun-prop-bills-bundle', timeAgo: '42 mins ago' },
  { id: 5, buyer: 'Visual FX Crew', location: 'Docklands, Melbourne VIC', product: 'AUD $10k Film Prop Bank Strapped Stack', slug: 'prop-money-stack-10k', timeAgo: '1 hr ago' },
  { id: 6, buyer: 'Marcus V.', location: 'Surry Hills, Sydney NSW', product: 'Photography Flat Lay Money Set', slug: 'photography-flat-lay-set', timeAgo: '2 hrs ago' },
  { id: 7, buyer: 'Production Coordinator', location: 'Broadbeach, Gold Coast QLD', product: 'USD $100 Prop Notes Full Print', slug: 'usd-100-full-print-prop-notes', timeAgo: '3 hrs ago' },
]

export default function RecentBuyerPopup() {
  const [visible, setVisible] = useState(false)
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const autoHideRef = useRef(null)

  useEffect(() => {
    if (isDismissed) return
    const initialTimer = setTimeout(() => setVisible(true), 10000)
    return () => clearTimeout(initialTimer)
  }, [isDismissed])

  useEffect(() => {
    if (isDismissed) return
    const cycleInterval = setInterval(() => {
      setCurrentOrderIndex((prev) => (prev + 1) % RECENT_ORDERS.length)
      setVisible(true)
    }, 80000)
    return () => clearInterval(cycleInterval)
  }, [isDismissed])

  useEffect(() => {
    if (!visible || isHovered) return
    autoHideRef.current = setTimeout(() => setVisible(false), 7000)
    return () => clearTimeout(autoHideRef.current)
  }, [visible, isHovered])

  if (isDismissed || !visible) return null

  const order = RECENT_ORDERS[currentOrderIndex]

  return (
    <div className="buyer-popup" role="status" aria-live="polite" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="buyer-popup-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      </div>
      <div className="buyer-popup-body">
        <p className="buyer-popup-verified">
          <span className="buyer-popup-dot" aria-hidden="true" />
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          Verified Purchase<span className="tp-sep">·</span><span className="buyer-popup-time">{order.timeAgo}</span>
        </p>
        <p className="buyer-popup-who"><strong>{order.buyer}</strong> in {order.location}</p>
        <p className="buyer-popup-what">purchased <Link to={'/product/' + order.slug + '/'}>{order.product}</Link></p>
      </div>
      <button type="button" className="buyer-popup-close" aria-label="Close notification" onClick={() => { setVisible(false); setIsDismissed(true) }}>×</button>
    </div>
  )
}
