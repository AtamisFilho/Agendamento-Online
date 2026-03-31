'use client'

import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useAppointments } from '@/lib/hooks/useAppointments'
import { AppointmentCard } from '@/components/appointments/AppointmentCard'
import { PageSpinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import type { Appointment } from '@/types/app.types'

export default function AppointmentsPage() {
  const { user, loading: userLoading } = useUser()
  const { appointments, loading } = useAppointments(user?.id)

  if (userLoading || loading) return <PageSpinner />

  const upcoming = appointments.filter(
    (a) => !['cancelled_by_client', 'cancelled_by_provider', 'completed', 'no_show'].includes(a.status)
  )
  const past = appointments.filter(
    (a) => ['cancelled_by_client', 'cancelled_by_provider', 'completed', 'no_show'].includes(a.status)
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meus agendamentos</h1>
        <Link
          href="/booking"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Novo agendamento
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <CalendarDays className="h-10 w-10 text-gray-300" />
          <div>
            <p className="font-medium text-gray-500">Nenhum agendamento ainda</p>
            <p className="text-sm text-gray-400">Que tal agendar seu primeiro horário?</p>
          </div>
          <Link
            href="/booking"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Agendar agora
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Próximos
              </h2>
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} href={`/appointments/${a.id}`} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Histórico
              </h2>
              <div className="space-y-3">
                {past.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} href={`/appointments/${a.id}`} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
