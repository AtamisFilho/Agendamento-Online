import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAppointmentEmail } from '@/lib/email/sendEmail'
import type { AppointmentEmailData } from '@/types/app.types'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const body = await request.json()
    const { status, internal_notes, cancellation_reason } = body

    // Fetch current appointment
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*, service:services(*), client:profiles!appointments_client_id_fkey(*)')
      .eq('id', id)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    // Authorization: client can only cancel their own appointment
    if (profile?.role === 'client') {
      if (appointment.client_id !== user.id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
      if (status !== 'cancelled_by_client') {
        return NextResponse.json({ error: 'Operação não permitida' }, { status: 403 })
      }

      // Check cancellation window
      const { data: settings } = await supabase
        .from('company_settings')
        .select('cancellation_hours')
        .eq('id', 1)
        .single()

      const cancellationHours = settings?.cancellation_hours ?? 24
      const now = new Date()
      const startsAt = new Date(appointment.starts_at)
      const hoursUntil = (startsAt.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntil < cancellationHours) {
        return NextResponse.json(
          { error: `Cancelamento só é permitido com ${cancellationHours}h de antecedência.` },
          { status: 400 }
        )
      }
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = { status }
    if (status === 'cancelled_by_client' || status === 'cancelled_by_provider') {
      updatePayload.cancelled_at = new Date().toISOString()
      updatePayload.cancellation_reason = cancellation_reason ?? null
    }
    if (internal_notes !== undefined && profile?.role === 'provider') {
      updatePayload.internal_notes = internal_notes
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 })
    }

    // Send cancellation email
    if (
      (status === 'cancelled_by_client' || status === 'cancelled_by_provider') &&
      appointment.client
    ) {
      const { data: settings } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', 1)
        .single()

      const { data: clientUser } = await supabase.auth.admin
        ? { data: null }
        : { data: null }

      // Get email from profiles join (we rely on the appointment's client profile + auth email lookup)
      // For simplicity, we'll use the profile full_name and look up email separately
      const emailData: AppointmentEmailData = {
        clientName: (appointment.client as { full_name: string }).full_name,
        serviceName: (appointment.service as { name: string }).name,
        startsAt: appointment.starts_at,
        endsAt: appointment.ends_at,
        companyName: settings?.name ?? 'Agendamento Online',
        companyPhone: settings?.contact_phone ?? null,
        appointmentId: id,
      }

      // We need to get the client email - fetch from notification_log or store it
      const { data: notifLog } = await supabase
        .from('notification_log')
        .select('recipient_email')
        .eq('appointment_id', id)
        .not('recipient_email', 'is', null)
        .limit(1)
        .single()

      if (notifLog?.recipient_email) {
        sendAppointmentEmail('cancellation', notifLog.recipient_email, emailData).catch(console.error)

        await supabase.from('notification_log').insert({
          appointment_id: id,
          type: 'cancellation',
          recipient_email: notifLog.recipient_email,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
