import { Resend } from 'resend'

// Lazy instantiation to avoid build-time errors when env vars aren't set
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
  }
  return _resend
}
