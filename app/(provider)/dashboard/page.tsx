'use client'

import { StatsCards } from '@/components/dashboard/StatsCards'
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable'
import { useAllAppointments } from '@/lib/hooks/useAppointments'
import { startOfDay, endOfDay } from 'date-fns'

export default function DashboardPage() {
  const { appointments, loading } = useAllAppointments()

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const todayAppointments = appointments.filter((a) => {
    const startsAt = new Date(a.starts_at)
    return startsAt >= todayStart && startsAt <= todayEnd
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visão geral</h1>
        <p className="text-sm text-gray-500">Resumo das atividades da sua agenda</p>
      </div>

      <StatsCards />

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Agendamentos de hoje</h2>
        <AppointmentsTable
          appointments={todayAppointments}
          loading={loading}
        />
      </div>
    </div>
  )
}
