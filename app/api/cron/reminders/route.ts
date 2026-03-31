import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAppointmentEmail } from '@/lib/email/sendEmail'
import type { AppointmentEmailData } from '@/types/app.types'

export async function GET(request: NextRequest) {
  // Protect cron route
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Fetch pending reminders that are due
  const { data: pendingReminders } = await supabase
    .from('notification_log')
    .select('*, appointment:appointments(*, service:services(*), client:profiles!appointments_client_id_fkey(*))')
    .eq('type', 'reminder')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50)

  if (!pendingReminders || pendingReminders.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  const { data: settings } = await supabase
    .from('company_settings')
    .select('*')
    .eq('id', 1)
    .single()

  let processed = 0

  for (const notif of pendingReminders) {
    const appointment = notif.appointment as {
      starts_at: string
      ends_at: string
      service: { name: string }
      client: { full_name: string }
    }

    if (!notif.recipient_email || !appointment) continue

    const emailData: AppointmentEmailData = {
      clientName: appointment.client?.full_name ?? '',
      serviceName: appointment.service?.name ?? '',
      startsAt: appointment.starts_at,
      endsAt: appointment.ends_at,
      companyName: settings?.name ?? 'Agendamento Online',
      companyPhone: settings?.contact_phone ?? null,
      appointmentId: notif.appointment_id,
    }

    try {
      const result = await sendAppointmentEmail('reminder', notif.recipient_email, emailData)
      const msgId = 'data' in result && result.data ? (result.data as { id?: string }).id ?? null : null
      await supabase
        .from('notification_log')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider_message_id: msgId,
        })
        .eq('id', notif.id)
      processed++
    } catch (err) {
      await supabase
        .from('notification_log')
        .update({ status: 'failed', error_message: String(err) })
        .eq('id', notif.id)
    }
  }

  return NextResponse.json({ processed })
}
