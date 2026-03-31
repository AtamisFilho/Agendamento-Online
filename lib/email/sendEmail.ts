import { getResend } from './resend'
import type { AppointmentEmailData } from '@/types/app.types'
import { formatDateTime } from '@/lib/utils/formatters'

type EmailType = 'confirmation' | 'reminder' | 'cancellation'

function buildSubject(type: EmailType, serviceName: string): string {
  switch (type) {
    case 'confirmation':
      return `Agendamento confirmado: ${serviceName}`
    case 'reminder':
      return `Lembrete: seu agendamento de ${serviceName} é amanhã`
    case 'cancellation':
      return `Agendamento cancelado: ${serviceName}`
  }
}

function buildHtml(type: EmailType, data: AppointmentEmailData): string {
  const dateStr = formatDateTime(data.startsAt)

  const colors = {
    confirmation: { bg: '#ecfdf5', border: '#10b981', icon: '✅', title: 'Agendamento Confirmado' },
    reminder: { bg: '#eff6ff', border: '#3b82f6', icon: '🔔', title: 'Lembrete de Agendamento' },
    cancellation: { bg: '#fef2f2', border: '#ef4444', icon: '❌', title: 'Agendamento Cancelado' },
  }

  const c = colors[type]

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.title}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <div style="background:#6366f1;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:20px;font-weight:700;">${data.companyName}</h1>
    </div>
    <div style="background:white;border-radius:0 0 12px 12px;padding:32px;border:1px solid #e5e7eb;border-top:none;">
      <div style="background:${c.bg};border:1px solid ${c.border};border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">
        <p style="margin:0;font-size:24px;">${c.icon}</p>
        <p style="margin:8px 0 0;font-weight:600;color:#111827;">${c.title}</p>
      </div>

      <p style="color:#374151;margin:0 0 8px;">Olá, <strong>${data.clientName}</strong>!</p>
      ${type === 'confirmation' ? '<p style="color:#6b7280;margin:0 0 24px;">Seu agendamento foi confirmado com sucesso.</p>' : ''}
      ${type === 'reminder' ? '<p style="color:#6b7280;margin:0 0 24px;">Não esqueça do seu agendamento amanhã!</p>' : ''}
      ${type === 'cancellation' ? '<p style="color:#6b7280;margin:0 0 24px;">Seu agendamento foi cancelado.</p>' : ''}

      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:14px;width:120px;">Serviço</td>
            <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:500;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:14px;">Data e hora</td>
            <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:500;">${dateStr}</td>
          </tr>
          ${data.notes ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;vertical-align:top;">Observações</td><td style="padding:6px 0;color:#111827;font-size:14px;">${data.notes}</td></tr>` : ''}
        </table>
      </div>

      ${data.companyPhone ? `<p style="color:#6b7280;font-size:14px;margin:0 0 4px;">Em caso de dúvidas, entre em contato:</p><p style="color:#6366f1;font-size:14px;font-weight:500;margin:0;">${data.companyPhone}</p>` : ''}
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">
      Este e-mail foi enviado automaticamente. Por favor, não responda.
    </p>
  </div>
</body>
</html>`
}

export async function sendAppointmentEmail(
  type: EmailType,
  to: string,
  data: AppointmentEmailData
) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn('Email not configured. Skipping send.')
    return { id: null }
  }

  const result = await getResend().emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: buildSubject(type, data.serviceName),
    html: buildHtml(type, data),
  })

  return result
}
