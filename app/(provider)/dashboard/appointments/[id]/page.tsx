'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime, formatDuration, formatCurrency, statusLabels } from '@/lib/utils/formatters'
import { AppointmentBadge } from '@/components/appointments/AppointmentBadge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Appointment, AppointmentStatus } from '@/types/app.types'

interface Props {
  params: Promise<{ id: string }>
}

const providerActions: { status: AppointmentStatus; label: string; variant: 'primary' | 'danger' | 'secondary' }[] = [
  { status: 'confirmed', label: 'Confirmar', variant: 'primary' },
  { status: 'completed', label: 'Marcar como concluído', variant: 'secondary' },
  { status: 'no_show', label: 'Não compareceu', variant: 'secondary' },
  { status: 'cancelled_by_provider', label: 'Cancelar', variant: 'danger' },
]

export default function DashboardAppointmentDetailPage({ params }: Props) {
  const { id } = use(params)
  const supabase = createClient()

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [internalNotes, setInternalNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchAppointment = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, service:services(*), client:profiles!appointments_client_id_fkey(*)')
      .eq('id', id)
      .single()

    setAppointment(data as Appointment | null)
    setInternalNotes((data as Appointment | null)?.internal_notes ?? '')
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointment()
  }, [id])

  const handleStatusChange = async (status: AppointmentStatus) => {
    setSaving(true)
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchAppointment()
    setSaving(false)
  }

  const handleSaveNotes = async () => {
    setSaving(true)
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internal_notes: internalNotes }),
    })
    setSaving(false)
  }

  if (loading) return <PageSpinner />
  if (!appointment) return <p>Agendamento não encontrado.</p>

  const service = appointment.service as { name: string; duration_minutes: number; price_cents: number; color: string }
  const client = appointment.client as { full_name: string; phone?: string }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/appointments"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Detalhes do agendamento</h1>
      </div>

      {/* Main info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900">{service?.name}</p>
            <p className="text-sm text-gray-500">{formatDateTime(appointment.starts_at)}</p>
          </div>
          <AppointmentBadge status={appointment.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm">
          <div>
            <p className="text-gray-400">Cliente</p>
            <p className="font-medium text-gray-900">{client?.full_name}</p>
            {client?.phone && <p className="text-gray-500">{client.phone}</p>}
          </div>
          <div>
            <p className="text-gray-400">Duração</p>
            <p className="font-medium text-gray-900">{formatDuration(service?.duration_minutes ?? 0)}</p>
          </div>
          <div>
            <p className="text-gray-400">Valor</p>
            <p className="font-medium text-gray-900">{formatCurrency(service?.price_cents ?? 0)}</p>
          </div>
        </div>

        {appointment.notes && (
          <div className="border-t border-gray-100 pt-4 text-sm">
            <p className="text-gray-400">Observações do cliente</p>
            <p className="text-gray-700">{appointment.notes}</p>
          </div>
        )}
      </div>

      {/* Internal notes */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Notas internas</h2>
        <textarea
          rows={3}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Adicione notas privadas sobre este agendamento..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <Button size="sm" onClick={handleSaveNotes} loading={saving}>
          Salvar notas
        </Button>
      </div>

      {/* Status actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Atualizar status</h2>
        <div className="flex flex-wrap gap-2">
          {providerActions
            .filter((a) => a.status !== appointment.status)
            .map((action) => (
              <Button
                key={action.status}
                variant={action.variant}
                size="sm"
                onClick={() => handleStatusChange(action.status)}
                loading={saving}
              >
                {action.label}
              </Button>
            ))}
        </div>
      </div>
    </div>
  )
}
