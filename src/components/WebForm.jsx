import React, { useRef, useState } from 'react'
import { SITE, waHref } from '../data/site.js'

// The definitive Web3Forms method: FormData body, Accept header only,
// no Content-Type, no action, no redirect field, JS redirect to thank-you.
export default function WebForm({ subject, thankYou, children, submitLabel }) {
  const formRef = useRef(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    const form = formRef.current
    // No Web3Forms key configured yet: record nothing, but honour the
    // thank-you flow so ordering still completes (WhatsApp carries orders).
    if (!SITE.web3formsKey || SITE.web3formsKey.startsWith('YOUR-')) {
      window.location.href = thankYou
      return
    }
    setErr(''); setBusy(true)
    const fd = new FormData(form)
    // Reply-to so a reply in the inbox goes straight to the sender.
    if (fd.get('Email')) fd.set('replyto', fd.get('Email'))
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd
    })
      .then(r => r.json().then(d => ({ status: r.status, data: d })))
      .then(res => {
        if (res.status === 200 && res.data.success) {
          window.location.href = thankYou
        } else {
          throw new Error((res.data && res.data.message) || 'Submission failed')
        }
      })
      .catch(() => {
        setBusy(false)
        setErr('Something went wrong sending your message. Please email us directly or message us on WhatsApp and we will sort it out fast.')
      })
  }

  return (
    <form ref={formRef} className="web-form" onSubmit={onSubmit}>
      <input type="hidden" name="access_key" value={SITE.web3formsKey} />
      <input type="hidden" name="subject" value={subject} />
      <input type="hidden" name="from_name" value="Aussie Prop Notes Website" />
      <input type="hidden" name="botcheck" value="" style={{ display: 'none' }} />
      {children}
      {err && <p className="form-err" role="alert">{err} <a href={waHref()} rel="nofollow noopener">Open WhatsApp</a></p>}
      <button className="btn btn-lg" type="submit" disabled={busy}>{busy ? 'Sending…' : submitLabel}</button>
    </form>
  )
}
