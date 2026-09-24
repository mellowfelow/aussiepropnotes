// Passcode gate for /api/admin/* routes. Vercel Node functions here (not
// Next.js), so this works directly against the (req, res) pair: call it
// first in every admin handler — if it returns true, the response has
// already been sent and the handler must return immediately.
export function checkAdminPasscode(req, res) {
  const configured = process.env.ADMIN_PASSCODE
  if (!configured) {
    res.status(503).json({ error: 'Admin passcode is not configured yet.' })
    return true
  }
  const given = req.headers['x-admin-passcode']
  if (given !== configured) {
    res.status(401).json({ error: 'Incorrect passcode.' })
    return true
  }
  return false
}
