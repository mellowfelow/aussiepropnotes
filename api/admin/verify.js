import { checkAdminPasscode } from '../../lib/adminAuth.js'

export default function handler(req, res) {
  if (checkAdminPasscode(req, res)) return
  return res.status(200).json({ ok: true })
}
