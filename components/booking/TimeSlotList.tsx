import { formatTime } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import type { AvailabilitySlot } from '@/types/app.types'
import { PageSpinner } from '@/components/ui/Spinner'

interface TimeSlotListProps {
  slots: AvailabilitySlot[]
  loading: boolean
  selectedSlotId: string | null
  onSlotSelect: (slot: AvailabilitySlot) => void
}

export function TimeSlotList({ slots, loading, selectedSlotId, onSlotSelect }: TimeSlotListProps) {
  if (loading) return <PageSpinner />

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 py-12 text-center">
        <p className="text-sm font-medium text-gray-500">Nenhum horário disponível</p>
        <p className="text-xs text-gray-400">Selecione outra data</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => {
        const isSelected = slot.id === selectedSlotId
        return (
          <button
            key={slot.id}
            onClick={() => onSlotSelect(slot)}
            className={cn(
              'rounded-xl border-2 py-3 text-center text-sm font-medium transition-all',
              isSelected
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'
            )}
          >
            {formatTime(slot.starts_at)}
          </button>
        )
      })}
    </div>
  )
}
