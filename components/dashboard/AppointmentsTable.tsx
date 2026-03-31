'use client'

import Link from 'next/link'
import { formatDateTime } from '@/lib/utils/formatters'
import { AppointmentBadge } from '@/components/appointments/AppointmentBadge'
import type { Appointment } from '@/types/app.types'

interface AppointmentsTableProps {
  appointments: Appointment[]
  loading?: boolean
}

export function AppointmentsTable({ appointments, loading }: AppointmentsTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
        Nenhum agendamento encontrado.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Serviço
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Data/Hora
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {appointments.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {(a.client as { full_name?: string })?.full_name ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {(a.service as { name?: string })?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDateTime(a.starts_at)}
              </td>
              <td className="px-4 py-3">
                <AppointmentBadge status={a.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/appointments/${a.id}`}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
