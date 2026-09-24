import React, { useState } from 'react'
import { useAdminPasscode } from '../../hooks/useAdminPasscode.js'

// Render-prop wrapper: (passcode) => ReactNode. Shows a lock screen until a
// passcode verifies, then renders the page with a "Lock admin" button.
export default function PasscodeGate({ children }) {
  const { passcode, verified, checking, error, verify, logout } = useAdminPasscode()
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (checking) {
    return <div className="admin-loading">Checking…</div>
  }

  if (!verified || !passcode) {
    return (
      <div className="admin-lock">
        <form
          className="admin-lock-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setSubmitting(true)
            await verify(input)
            setSubmitting(false)
          }}
        >
          <div className="admin-lock-icon" aria-hidden="true">🔒</div>
          <h1>Admin</h1>
          <p>Enter the admin passcode to continue.</p>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Passcode"
            aria-label="Admin passcode"
          />
          {error && <p className="form-err" role="alert">{error}</p>}
          <button type="submit" className="btn btn-lg" disabled={submitting || !input}>
            {submitting ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <div className="admin-lock-out">
        <button type="button" className="admin-logout" onClick={logout}>Lock admin</button>
      </div>
      {children(passcode)}
    </div>
  )
}
