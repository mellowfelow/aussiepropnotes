import React, { useState } from 'react'

// Pill-shaped click-to-copy tag. The whole pill is the click target.
export default function CopyField({ label, value, mono }) {
  const [copied, setCopied] = useState(false)
  async function onClick() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button type="button" className="copy-field" onClick={onClick}>
      <span className="copy-field-label">{label}:</span>
      <span className={'copy-field-value' + (mono ? ' mono' : '')}>{value}</span>
      <span className="copy-field-icon" aria-hidden="true">{copied ? '✓' : '⧉'}</span>
      <span className="sr-only">{copied ? 'Copied' : 'Copy to clipboard'}</span>
    </button>
  )
}
