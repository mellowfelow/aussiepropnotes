import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SITE } from '../data/site.js'
import PasscodeGate from '../components/admin/PasscodeGate.jsx'

async function api(path, passcode, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { 'X-Admin-Passcode': passcode, ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...opts.headers },
  })
  let data
  try { data = await res.json() } catch { throw new Error('Unexpected response from the server.') }
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

function AdminNav() {
  return (
    <nav className="admin-nav">
      <Link to="/admin/">Dashboard</Link>
      <Link to="/admin/orders/">Orders</Link>
      <Link to="/admin/enquiries/">Enquiries</Link>
    </nav>
  )
}

function StorageNotice({ configured }) {
  if (configured) return null
  return (
    <p className="admin-notice">Storage isn't configured yet — add <code>UPSTASH_REDIS_REST_URL</code> and <code>UPSTASH_REDIS_REST_TOKEN</code> as Vercel env vars. Orders and enquiries are still emailed in the meantime.</p>
  )
}

function Dashboard({ passcode }) {
  const [orders, setOrders] = useState(null)
  const [enquiries, setEnquiries] = useState(null)
  const [configured, setConfigured] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [o, e] = await Promise.all([api('/api/admin/orders', passcode), api('/api/admin/enquiries', passcode)])
      setOrders(o.orders || []); setEnquiries(e.enquiries || []); setConfigured(o.configured && e.configured)
    } catch (err) { setError(err.message) }
  }, [passcode])

  useEffect(() => { load() }, [load])

  const pending = (orders || []).filter((o) => o.status !== 'payment-sent').length
  const newEnq = (enquiries || []).filter((e) => e.status === 'new').length

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-head"><h1>Dashboard</h1><button type="button" className="btn btn-sm btn-ghost" onClick={load}>Refresh</button></div>
      <StorageNotice configured={configured} />
      {error && <p className="form-err" role="alert">{error}</p>}
      <div className="admin-cards">
        <Link to="/admin/orders/" className="admin-card">
          <strong>Orders</strong>
          <span className="admin-card-num">{orders === null ? '—' : orders.length}</span>
          <span className="admin-card-sub">{pending > 0 ? `${pending} pending payment` : 'all handled'}</span>
        </Link>
        <Link to="/admin/enquiries/" className="admin-card">
          <strong>Enquiries</strong>
          <span className="admin-card-num">{enquiries === null ? '—' : enquiries.length}</span>
          <span className="admin-card-sub">{newEnq > 0 ? `${newEnq} new` : 'all handled'}</span>
        </Link>
      </div>
    </div>
  )
}

function OrdersList({ passcode }) {
  const [orders, setOrders] = useState(null)
  const [configured, setConfigured] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try { const d = await api('/api/admin/orders', passcode); setOrders(d.orders || []); setConfigured(d.configured) }
    catch (err) { setError(err.message) }
  }, [passcode])

  useEffect(() => { load() }, [load])

  async function remove(orderNumber) {
    if (!confirm(`Delete order ${orderNumber}? This can't be undone.`)) return
    await api(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, passcode, { method: 'DELETE' })
    load()
  }

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-head"><h1>Orders</h1><button type="button" className="btn btn-sm btn-ghost" onClick={load}>Refresh</button></div>
      <StorageNotice configured={configured} />
      {error && <p className="form-err" role="alert">{error}</p>}
      {orders === null ? (error ? null : <p>Loading…</p>) : orders.length === 0 ? <p className="admin-empty">No orders yet.</p> : (
        <div className="admin-list">
          {orders.map((o) => (
            <div key={o.orderNumber} className="admin-row">
              <div className="admin-row-main">
                <div className="admin-row-tags">
                  <span className="admin-tag mono">{o.orderNumber}</span>
                  <span className={'admin-pill' + (o.status === 'payment-sent' ? ' green' : ' amber')}>{o.status === 'payment-sent' ? 'Sent' : 'Pending'}</span>
                  <span className="admin-pill">{o.channel}</span>
                </div>
                <strong>{o.customerName}</strong>
                <span className="admin-row-sub">{o.customerEmail || o.customerPhone || 'No contact info'} · {new Date(o.createdAt).toLocaleString('en-AU')}</span>
              </div>
              <div className="admin-row-end">
                <strong>{SITE.currency} ${o.amountDue}</strong>
                <span className="admin-row-sub">{o.items.length} item{o.items.length === 1 ? '' : 's'}</span>
              </div>
              <div className="admin-row-actions">
                <Link className="btn btn-sm" to={`/admin/send-payment-email/?id=${encodeURIComponent(o.orderNumber)}`}>Send payment</Link>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => remove(o.orderNumber)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EnquiriesList({ passcode }) {
  const [enquiries, setEnquiries] = useState(null)
  const [configured, setConfigured] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')

  const load = useCallback(async () => {
    setError('')
    try { const d = await api('/api/admin/enquiries', passcode); setEnquiries(d.enquiries || []); setConfigured(d.configured) }
    catch (err) { setError(err.message) }
  }, [passcode])

  useEffect(() => { load() }, [load])

  async function remove(id) {
    if (!confirm('Delete this enquiry?')) return
    await api(`/api/admin/enquiries/${encodeURIComponent(id)}`, passcode, { method: 'DELETE' })
    load()
  }

  const tabs = ['all', 'contact', 'wholesale', 'newsletter', 'new', 'replied']
  const filtered = (enquiries || []).filter((e) => tab === 'all' || e.type === tab || e.status === tab)

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-head"><h1>Enquiries</h1><button type="button" className="btn btn-sm btn-ghost" onClick={load}>Refresh</button></div>
      <StorageNotice configured={configured} />
      {error && <p className="form-err" role="alert">{error}</p>}
      <div className="admin-tabs">
        {tabs.map((t) => <button key={t} type="button" className={'admin-tab' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {enquiries === null ? (error ? null : <p>Loading…</p>) : filtered.length === 0 ? <p className="admin-empty">No enquiries here.</p> : (
        <div className="admin-list">
          {filtered.map((e) => (
            <div key={e.id} className="admin-row">
              <div className="admin-row-main">
                <div className="admin-row-tags">
                  <span className="admin-pill">{e.type}</span>
                  <span className={'admin-pill' + (e.status === 'replied' ? ' green' : ' amber')}>{e.status}</span>
                </div>
                <strong>{e.name || e.email || 'Unknown'}</strong>
                <span className="admin-row-sub">{e.email || e.phone || '—'} · {new Date(e.createdAt).toLocaleString('en-AU')}</span>
              </div>
              <div className="admin-row-actions">
                {e.email && <Link className="btn btn-sm" to={`/admin/reply-enquiry/?id=${encodeURIComponent(e.id)}`}>Reply</Link>}
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => remove(e.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SendPaymentComposer({ passcode }) {
  const [params] = useSearchParams()
  const orderId = params.get('id') || ''
  const [order, setOrder] = useState(null)
  const [orderLookupFailed, setOrderLookupFailed] = useState(false)
  // Prefilled from the order-notification email's link (?email=&amount=) so
  // this composer works even before Redis is set up — there's no stored
  // order to fetch yet, but the email carried enough to act on directly.
  const [customEmail, setCustomEmail] = useState(() => params.get('email') || '')
  const [amountInput, setAmountInput] = useState(() => params.get('amount') || '')
  const [methodId, setMethodId] = useState(SITE.reply.paymentMethods[0].id)
  const [mode, setMode] = useState('template')
  const [detail, setDetail] = useState('')
  const [template, setTemplate] = useState('')
  const [touched, setTouched] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) return
    api(`/api/admin/orders/${encodeURIComponent(orderId)}`, passcode)
      .then((d) => {
        setOrder(d.order)
        if (!customEmail && d.order.customerEmail) setCustomEmail(d.order.customerEmail)
        if (!amountInput && d.order.amountDue) setAmountInput(String(d.order.amountDue))
      })
      .catch(() => setOrderLookupFailed(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, passcode])

  const method = SITE.reply.paymentMethods.find((m) => m.id === methodId)
  const amount = amountInput
  const opening = (method.opening || '').replace('{amount}', amount).replace('{ref}', orderId)
  const closing = (method.closing || '').replace('{amount}', amount).replace('{ref}', orderId)

  useEffect(() => { if (mode === 'template' && !touched) setTemplate([opening, closing].filter(Boolean).join('\n\n')) }, [mode, touched, opening, closing])

  const instructions = mode === 'template' ? template : [opening, detail, closing].filter(Boolean).join('\n\n')
  const to = customEmail

  async function send() {
    setSending(true); setError(''); setSent(false)
    try {
      await api('/api/admin/send-payment-email', passcode, {
        method: 'POST',
        body: JSON.stringify({ orderNumber: orderId, methodId, detail: mode === 'paste' ? detail : '', customEmail: to, amount }),
      })
      setSent(true)
    } catch (err) { setError(err.message) } finally { setSending(false) }
  }

  return (
    <div className="admin-page">
      <AdminNav />
      <h1>Send Payment Details</h1>
      {order ? <p className="admin-sub">Order {order.orderNumber} — {order.customerName}</p> : orderId && (
        <p className="admin-hint">{orderLookupFailed ? "No stored order found (storage isn't configured yet) — using the details from the order email link." : 'Loading order…'}</p>
      )}
      <div className="admin-card-block">
        <div className="field-grid">
          <label>Customer email<input type="email" value={to} onChange={(e) => setCustomEmail(e.target.value)} placeholder="customer@example.com" /></label>
          <label>Amount due ({SITE.currency})<input value={amount} onChange={(e) => setAmountInput(e.target.value)} placeholder="0.00" /></label>
        </div>
        <label>Payment method
          <select value={methodId} onChange={(e) => { setMethodId(e.target.value); setTouched(false) }}>
            {SITE.reply.paymentMethods.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <div className="admin-mode-toggle">
          <button type="button" className={mode === 'template' ? 'on' : ''} onClick={() => { setMode('template'); setTouched(false) }}>Template</button>
          <button type="button" className={mode === 'paste' ? 'on' : ''} onClick={() => { setMode('paste'); setDetail('') }}>Paste</button>
        </div>
        {mode === 'paste' && <p className="admin-hint">{opening}</p>}
        <textarea rows={mode === 'paste' ? 4 : 7} value={mode === 'paste' ? detail : template}
          onChange={(e) => { if (mode === 'paste') setDetail(e.target.value); else { setTemplate(e.target.value); setTouched(true) } }}
          placeholder={mode === 'paste' ? 'Paste just the payment detail — BSB/account, PayID handle or wallet address.' : undefined} />
        {mode === 'paste' && <p className="admin-hint">{closing}</p>}
      </div>
      {error && <p className="form-err" role="alert">{error}</p>}
      {sent && <p className="admin-success">Payment details sent.</p>}
      <button type="button" className="btn btn-lg" disabled={sending || !to || !amount || !instructions.trim()} onClick={send}>
        {sending ? 'Sending…' : `Send to ${to || 'customer'}`}
      </button>
    </div>
  )
}

function ReplyEnquiryComposer({ passcode }) {
  const [params] = useSearchParams()
  const enquiryId = params.get('id') || ''
  const [enquiry, setEnquiry] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enquiryId) return
    api(`/api/admin/enquiries/${encodeURIComponent(enquiryId)}`, passcode).then((d) => setEnquiry(d.enquiry)).catch(() => {})
  }, [enquiryId, passcode])

  async function send() {
    setSending(true); setError(''); setSent(false)
    try {
      await api('/api/admin/reply-enquiry', passcode, { method: 'POST', body: JSON.stringify({ enquiryId, message }) })
      setSent(true)
    } catch (err) { setError(err.message) } finally { setSending(false) }
  }

  return (
    <div className="admin-page">
      <AdminNav />
      <h1>Reply to Enquiry</h1>
      {enquiry ? (
        <div className="admin-card-block">
          <strong>{enquiry.name} <span className="admin-row-sub">· {enquiry.type} enquiry</span></strong>
          <p className="admin-row-sub">{enquiry.email || enquiry.phone}</p>
          <p className="admin-quote">{enquiry.message}</p>
        </div>
      ) : <p>Loading enquiry…</p>}
      <label>Your reply<textarea rows={8} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your reply…" /></label>
      {error && <p className="form-err" role="alert">{error}</p>}
      {sent && <p className="admin-success">Reply sent.</p>}
      <button type="button" className="btn btn-lg" disabled={sending || !message || !enquiry?.email} onClick={send}>
        {sending ? 'Sending…' : 'Send reply'}
      </button>
      {enquiry && !enquiry.email && <p className="admin-hint">This enquiry has no email address — reply by phone or WhatsApp instead.</p>}
    </div>
  )
}

export function AdminHome() { return <PasscodeGate>{(p) => <Dashboard passcode={p} />}</PasscodeGate> }
export function AdminOrders() { return <PasscodeGate>{(p) => <OrdersList passcode={p} />}</PasscodeGate> }
export function AdminEnquiries() { return <PasscodeGate>{(p) => <EnquiriesList passcode={p} />}</PasscodeGate> }
export function AdminSendPayment() { return <PasscodeGate>{(p) => <SendPaymentComposer passcode={p} />}</PasscodeGate> }
export function AdminReplyEnquiry() { return <PasscodeGate>{(p) => <ReplyEnquiryComposer passcode={p} />}</PasscodeGate> }
