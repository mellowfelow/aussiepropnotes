import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'apn-admin-passcode'

// Verifies a passcode against /api/admin/verify, persists it in localStorage
// (namespaced, wrapped in try/catch so private browsing still works for the
// session), and auto-re-verifies on load.
export function useAdminPasscode() {
  const [passcode, setPasscode] = useState(null)
  const [verified, setVerified] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState(null)

  const verify = useCallback(async (candidate) => {
    setChecking(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/verify', { headers: { 'X-Admin-Passcode': candidate } })
      if (res.ok) {
        setPasscode(candidate)
        setVerified(true)
        try { localStorage.setItem(STORAGE_KEY, candidate) } catch {}
        return true
      }
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Incorrect passcode.')
      return false
    } catch {
      setError('Could not reach the server — try again.')
      return false
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    let stored = null
    try { stored = localStorage.getItem(STORAGE_KEY) } catch {}
    if (stored) verify(stored).finally(() => setChecking(false))
    else setChecking(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = useCallback(() => {
    setPasscode(null)
    setVerified(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { passcode, verified, checking, error, verify, logout }
}
