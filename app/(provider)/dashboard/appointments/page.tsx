'use client'

import { useState } from 'react'
import { useAllAppointments } from '@/lib/hooks/useAppointments'
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable'
import type { AppointmentStatus } from '@/types/app.types'
import { statusLabels } from '@/lib/utils/formatters'

const statusOptions: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: statusLabels.pending },
  { value: 'confirmed', label: statusLabels.confirmed },
  { value: 'cancelled_by_client', label: 'Cancelados' },
  { value: 'completed', label: statusLabels.completed },
]

export default function DashboardAppointmentsPage() {
  const { appointments, loading } = useAllAppointments()
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = appointments.filter((a) => {
    const matchesStatus = filter === 'all' || a.status === filter
    const matchesSearch =
      !search ||
      (a.client as { full_name?: string })?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      (a.service as { name?: string })?.name?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por cliente ou serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <div className="flex gap-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <AppointmentsTable appointments={filtered} loading={loading} />
    </div>
  )
}
