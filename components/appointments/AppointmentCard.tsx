import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils/formatters'
import { AppointmentBadge } from './AppointmentBadge'
import type { Appointment } from '@/types/app.types'

interface AppointmentCardProps {
  appointment: Appointment
  href?: string
}

export function AppointmentCard({ appointment, href }: AppointmentCardProps) {
  const service = appointment.service

  const content = (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-xl"
          style={{
            backgroundColor: (service?.color ?? '#6366f1') + '20',
            border: `2px solid ${service?.color ?? '#6366f1'}`,
          }}
        />
        <div>
          <p className="font-semibold text-gray-900">{service?.name ?? 'Serviço'}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(appointment.starts_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(appointment.starts_at)}
            </span>
          </div>
          {service && (
            <p className="mt-1 text-sm font-medium text-indigo-600">
              {formatCurrency(service.price_cents)}
            </p>
          )}
        </div>
      </div>
      <AppointmentBadge status={appointment.status} />
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
