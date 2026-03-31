'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime, formatCurrency, formatDuration } from '@/lib/utils/formatters'
import { AppointmentBadge } from '@/components/appointments/AppointmentBadge'
import { CancelModal } from '@/components/appointments/CancelModal'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Appointment } from '@/types/app.types'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}

export default function AppointmentDetailPage({ params, searchParams }: Props) {
  const { id } = use(params)
  const { success } = use(searchParams)
  const router = useRouter()
  const supabase = createClient()

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointment = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, service:services(*), client:profiles!appointments_client_id_fkey(*)')
      .eq('id', id)
      .single()

    setAppointment(data as Appointment | null)
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointment()
  }, [id])

  const handleCancel = async (reason: string) => {
    setError(null)
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled_by_client', cancellation_reason: reason }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Erro ao cancelar')
      return
    }

    await fetchAppointment()
  }

  if (loading) return <PageSpinner />
  if (!appointment) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Agendamento não encontrado.</p>
        <Link href="/appointments" className="mt-4 inline-block text-sm text-indigo-600">
          Voltar para meus agendamentos
        </Link>
      </div>
    )
  }

  const service = appointment.service
  const canCancel = !['cancelled_by_client', 'cancelled_by_provider', 'completed', 'no_show'].includes(appointment.status)

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/appointments"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      {success === '1' && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          Agendamento confirmado! Você receberá um e-mail de confirmação em breve.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-xl"
              style={{
                backgroundColor: (service?.color ?? '#6366f1') + '20',
                border: `2px solid ${service?.color ?? '#6366f1'}`,
              }}
            />
            <div>
              <h1 className="font-bold text-gray-900">{service?.name}</h1>
              {service?.description && (
                <p className="text-sm text-gray-500">{service.description}</p>
              )}
            </div>
          </div>
          <AppointmentBadge status={appointment.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Data</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(appointment.starts_at)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Horário</p>
              <p className="text-sm font-medium text-gray-900">
                {formatTime(appointment.starts_at)} – {formatTime(appointment.ends_at)}
              </p>
            </div>
          </div>
          {service && (
            <>
              <div>
                <p className="text-xs text-gray-400">Duração</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDuration(service.duration_minutes)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Valor</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(service.price_cents)}
                </p>
              </div>
            </>
          )}
        </div>

        {appointment.notes && (
          <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-4">
            <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Suas observações</p>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          </div>
        )}

        {appointment.cancellation_reason && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">Motivo do cancelamento</p>
            <p className="text-sm text-gray-700">{appointment.cancellation_reason}</p>
          </div>
        )}
      </div>

      {canCancel && (
        <div className="mt-4">
          <Button variant="danger" onClick={() => setCancelOpen(true)} className="w-full">
            Cancelar agendamento
          </Button>
        </div>
      )}

      <CancelModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />
    </div>
  )
}
