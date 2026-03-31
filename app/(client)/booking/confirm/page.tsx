'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookingSteps } from '@/components/booking/BookingSteps'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDuration, formatTime } from '@/lib/utils/formatters'
import type { Service, AvailabilitySlot } from '@/types/app.types'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('serviceId')
  const slotId = searchParams.get('slotId')

  const supabase = createClient()
  const [service, setService] = useState<Service | null>(null)
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!serviceId || !slotId) {
      router.replace('/booking')
      return
    }

    const fetchData = async () => {
      const [{ data: svc }, { data: sl }] = await Promise.all([
        supabase.from('services').select('*').eq('id', serviceId).single(),
        supabase.from('availability_slots').select('*').eq('id', slotId).single(),
      ])

      if (!svc || !sl) {
        router.replace('/booking')
        return
      }

      setService(svc as Service)
      setSlot(sl as AvailabilitySlot)
      setLoading(false)
    }

    fetchData()
  }, [serviceId, slotId])

  const handleConfirm = async () => {
    if (!serviceId || !slotId || !service || !slot) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: serviceId, slot_id: slotId, notes }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro ao confirmar agendamento.')
        setSubmitting(false)
        return
      }

      router.push(`/appointments/${data.id}?success=1`)
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setSubmitting(false)
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div>
      <BookingSteps currentStep={3} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Confirmar agendamento</h1>
      <p className="mb-6 text-sm text-gray-500">Revise os detalhes antes de confirmar.</p>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div
              className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-xl"
              style={{ backgroundColor: service!.color + '20', border: `2px solid ${service!.color}` }}
            />
            <div>
              <p className="font-semibold text-gray-900">{service!.name}</p>
              {service!.description && (
                <p className="text-sm text-gray-500">{service!.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Data</p>
              <p className="mt-1 font-medium text-gray-900 capitalize">
                {format(new Date(slot!.starts_at), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Horário</p>
              <p className="mt-1 font-medium text-gray-900">
                {formatTime(slot!.starts_at)} – {formatTime(slot!.ends_at)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Duração</p>
              <p className="mt-1 font-medium text-gray-900">
                {formatDuration(service!.duration_minutes)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Valor</p>
              <p className="mt-1 font-medium text-gray-900">
                {formatCurrency(service!.price_cents)}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-400" htmlFor="notes">
              Observações (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Informe algo importante para o prestador..."
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
          Voltar
        </Button>
        <Button onClick={handleConfirm} loading={submitting}>
          Confirmar agendamento
        </Button>
      </div>
    </div>
  )
}

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <ConfirmContent />
    </Suspense>
  )
}
