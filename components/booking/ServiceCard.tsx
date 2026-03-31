import { Clock, DollarSign } from 'lucide-react'
import type { Service } from '@/types/app.types'
import { formatCurrency, formatDuration } from '@/lib/utils/formatters'

interface ServiceCardProps {
  service: Service
  onSelect: (service: Service) => void
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <button
      onClick={() => onSelect(service)}
      className="group flex flex-col gap-3 rounded-xl border-2 border-gray-200 bg-white p-5 text-left transition-all hover:border-indigo-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="h-10 w-10 rounded-xl"
          style={{ backgroundColor: service.color + '20', border: `2px solid ${service.color}` }}
        >
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: service.color }} />
          </div>
        </div>
        <span className="text-base font-semibold text-indigo-600">
          {formatCurrency(service.price_cents)}
        </span>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700">{service.name}</h3>
        {service.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{service.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Clock className="h-3.5 w-3.5" />
        <span>{formatDuration(service.duration_minutes)}</span>
      </div>
    </button>
  )
}
