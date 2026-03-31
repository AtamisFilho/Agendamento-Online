import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAppointmentSchema } from '@/lib/validations/booking'
import { sendAppointmentEmail } from '@/lib/email/sendEmail'
import type { AppointmentEmailData } from '@/types/app.types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Validate input
    const body = await request.json()
    const parsed = createAppointmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { service_id, slot_id, notes } = parsed.data

    // Fetch slot
    const { data: slot, error: slotError } = await supabase
      .from('availability_slots')
      .select('*, bookings_count:appointments(count)')
      .eq('id', slot_id)
      .eq('is_active', true)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Horário não encontrado' }, { status: 404 })
    }

    // Check slot availability
    const booked = (slot as { bookings_count: { count: number }[] }).bookings_count?.[0]?.count ?? 0
    if (booked >= slot.max_bookings) {
      return NextResponse.json({ error: 'Horário já está ocupado' }, { status: 409 })
    }

    // Fetch service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    // Fetch provider (first user with role = provider)
    const { data: provider } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'provider')
      .limit(1)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Prestador não encontrado' }, { status: 404 })
    }

    // Fetch company settings
    const { data: settings } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single()

    // Create appointment
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        client_id: user.id,
        provider_id: provider.id,
        service_id,
        slot_id,
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
        status: 'confirmed',
        notes: notes ?? null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      if (insertError.message?.includes('fully booked')) {
        return NextResponse.json({ error: 'Horário já está ocupado' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
    }

    // Schedule reminder in notification_log
    const reminderHours = settings?.reminder_hours ?? 24
    const reminderAt = new Date(new Date(slot.starts_at).getTime() - reminderHours * 60 * 60 * 1000)

    await supabase.from('notification_log').insert([
      {
        appointment_id: appointment.id,
        type: 'confirmation',
        recipient_email: user.email,
        status: 'pending',
        scheduled_for: new Date().toISOString(),
      },
      {
        appointment_id: appointment.id,
        type: 'reminder',
        recipient_email: user.email,
        status: 'pending',
        scheduled_for: reminderAt.toISOString(),
      },
    ])

    // Fetch client profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Send confirmation email asynchronously (don't block response)
    if (user.email) {
      const emailData: AppointmentEmailData = {
        clientName: profile?.full_name ?? user.email,
        serviceName: service.name,
        startsAt: slot.starts_at,
        endsAt: slot.ends_at,
        companyName: settings?.name ?? 'Agendamento Online',
        companyPhone: settings?.contact_phone ?? null,
        appointmentId: appointment.id,
        notes: notes ?? null,
      }

      sendAppointmentEmail('confirmation', user.email, emailData)
        .then(async (result) => {
          const msgId = 'data' in result && result.data ? (result.data as { id?: string }).id ?? null : null
          await supabase
            .from('notification_log')
            .update({ status: 'sent', sent_at: new Date().toISOString(), provider_message_id: msgId })
            .eq('appointment_id', appointment.id)
            .eq('type', 'confirmation')
        })
        .catch(async (err) => {
          console.error('Email error:', err)
          await supabase
            .from('notification_log')
            .update({ status: 'failed', error_message: String(err) })
            .eq('appointment_id', appointment.id)
            .eq('type', 'confirmation')
        })
    }

    return NextResponse.json({ id: appointment.id }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
