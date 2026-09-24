import { SITE } from '../src/data/site.js'

// Invariant light-theme email shell (see references/forms.md in the WebForge
// skill). White card, dark brand header band, near-black text, brand colour
// used only as an accent — never a dark body. Zoho Mail and Gmail dark mode
// force-invert dark-background emails with no HTML opt-out that survives
// real-world testing; light emails are left alone. Only reply.brand.primary
// (accent) and reply.brand.headerDark (header band) vary per site — never
// hardcode a hex value in this file.
const PAGE = '#F4F0EA'
const CARD = '#FFFFFF'
const FOOTER_BG = '#F7F4F0'
const BORDER = '#EAE3DC'
const TEXT = '#1A1414'
const MUTED = '#6F665F'
const SERIF = "Georgia,'Times New Roman',serif"
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const MONO = "SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace"

export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function row(r, accent) {
  if (r.heading) {
    return `<tr><td colspan="2" style="padding:${r._first ? '0' : '22px'} 0 6px;border-bottom:2px solid ${accent};font:700 11px ${SANS};letter-spacing:.06em;text-transform:uppercase;color:${accent}">${escapeHtml(r.label)}</td></tr>`
  }
  if (r.block) {
    return `<tr><td colspan="2" style="padding:10px 0;border-bottom:1px solid ${BORDER};font:13.5px/1.6 ${SANS};color:${TEXT};white-space:pre-wrap">${r.html || escapeHtml(r.value)}</td></tr>`
  }
  if (r.highlight) {
    return `<tr><td colspan="2" style="padding:16px 0 4px;border-top:2px solid ${accent}"><table role="presentation" width="100%"><tr>
      <td style="font:700 11px ${SANS};letter-spacing:.04em;text-transform:uppercase;color:${MUTED}">${escapeHtml(r.label)}</td>
      <td align="right" style="font:700 24px ${MONO};color:${accent}">${r.html || escapeHtml(r.value)}</td>
    </tr></table></td></tr>`
  }
  return `<tr>
    <td style="width:42%;vertical-align:top;padding:9px 0;border-bottom:1px solid ${BORDER};font:12.5px ${SANS};color:${MUTED}">${escapeHtml(r.label)}</td>
    <td align="right" style="vertical-align:top;padding:9px 0;border-bottom:1px solid ${BORDER};font:${r.mono ? '700 13.5px ' + MONO : '700 13.5px ' + SANS};color:${TEXT}">${r.html || escapeHtml(r.value)}</td>
  </tr>`
}

function button(label, url, accent, solid) {
  const bg = solid ? accent : '#FFFFFF'
  const color = solid ? '#FFFFFF' : accent
  const border = solid ? accent : accent
  return `<a href="${escapeHtml(url)}" style="display:inline-block;background:${bg};color:${color};border:1.5px solid ${border};border-radius:10px;padding:14px 30px;font:700 14px ${SANS};text-decoration:none">${escapeHtml(label)}</a>`
}

export function buildEmailHtml({ title, preheader, intro, refBadge, rows = [], afterRows = '', cta, secondaryCta, footer, primaryColor }) {
  const accent = primaryColor || SITE.reply.brand.primary
  const headerDark = SITE.reply.brand.headerDark
  const rowsHtml = rows.map((r, i) => row(i === 0 ? { ...r, _first: true } : r, accent)).join('')
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${PAGE}">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>` : ''}
<table role="presentation" width="100%" style="background:${PAGE};padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="600" style="max-width:600px;width:100%;background:${CARD};border-radius:16px;overflow:hidden">
<tr><td style="background:${headerDark};padding:26px 32px;border-bottom:3px solid ${accent}">
  <div style="font:700 22px ${SERIF};letter-spacing:.03em;text-transform:uppercase;color:#FFFFFF">${escapeHtml(SITE.brand)}</div>
  ${SITE.reply.bizNumber ? `<div style="font:700 11px ${SANS};color:${accent};margin-top:4px">${escapeHtml(SITE.reply.bizNumber.label)} ${escapeHtml(SITE.reply.bizNumber.value)}</div>` : ''}
  <div style="font:10.5px ${SANS};letter-spacing:.05em;text-transform:uppercase;color:#C9C2B8;margin-top:4px">${escapeHtml(SITE.reply.headerTagline)}</div>
</td></tr>
<tr><td style="padding:32px 32px 8px">
  <h1 style="margin:0 0 10px;font:700 20px ${SANS};color:${TEXT}">${escapeHtml(title)}</h1>
  ${refBadge ? `<div style="display:inline-block;border:1.5px solid ${accent};color:${accent};border-radius:999px;padding:4px 14px;font:700 12px ${MONO};margin-bottom:10px">${escapeHtml(refBadge)}</div>` : ''}
  ${intro ? `<p style="margin:0 0 6px;font:14px/1.6 ${SANS};color:${TEXT}">${intro}</p>` : ''}
</td></tr>
<tr><td style="padding:18px 32px 4px">
  <table role="presentation" width="100%" style="border-collapse:collapse">${rowsHtml}</table>
  ${afterRows}
</td></tr>
${(cta || secondaryCta) ? `<tr><td style="padding:14px 32px 8px">
  ${cta ? button(cta.label, cta.url, accent, true) : ''}
  ${cta && secondaryCta ? '&nbsp;&nbsp;' : ''}
  ${secondaryCta ? button(secondaryCta.label, secondaryCta.url, accent, false) : ''}
</td></tr>` : ''}
<tr><td style="background:${FOOTER_BG};border-top:1px solid ${BORDER};padding:20px 32px">
  <p style="margin:0;font:11.5px/1.6 ${SANS};color:${MUTED}">${footer || escapeHtml(SITE.brand + ' — ' + SITE.domain)}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
