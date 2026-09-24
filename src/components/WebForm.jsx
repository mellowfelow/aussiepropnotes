import React, { useRef, useState } from 'react'
import { waHref } from '../data/site.js'

// Posts JSON to /api/contact — a Vercel serverless function backed by SMTP
// (see lib/mailer.js) and, when Upstash Redis is configured, the Reply
// Portal dashboard. Field `name` attributes are used as-is as the email
// labels, so keep them human ("Delivery Address", not "delivery_address").
export default function WebForm({ type = 'contact', thankYou, children, submitLabel }) {
  const formRef = useRef(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    setErr(''); setBusy(true)
    const fields = Object.fromEntries(new FormData(formRef.current).entries())
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, fields }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) window.location.href = thankYou
        else throw new Error((data && data.error) || 'Submission failed')
      })
      .catch(() => {
        setBusy(false)
        setErr('Something went wrong sending your message. Please email us directly or message us on WhatsApp and we will sort it out fast.')
      })
  }

  return (
    <form ref={formRef} className="web-form" onSubmit={onSubmit}>
      <input type="hidden" name="botcheck" value="" style={{ display: 'none' }} />
      {children}
      {err && <p className="form-err" role="alert">{err} <a href={waHref()} rel="nofollow noopener">Open WhatsApp</a></p>}
      <button className="btn btn-lg" type="submit" disabled={busy}>{busy ? 'Sending…' : submitLabel}</button>
    </form>
  )
}
