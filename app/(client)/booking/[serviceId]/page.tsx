'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { BookingSteps } from '@/components/booking/BookingSteps'
import { DatePicker } from '@/components/booking/DatePicker'
import { TimeSlotList } from '@/components/booking/TimeSlotList'
import { Button } from '@/components/ui/Button'
import { useSlots, useSlotsForDate } from '@/lib/hooks/useSlots'
import type { AvailabilitySlot } from '@/types/app.types'

interface Props {
  params: Promise<{ serviceId: string }>
}

export default function BookingSlotPage({ params }: Props) {
  const { serviceId } = use(params)
  const router = useRouter()

  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)

  const { slots: monthSlots } = useSlots(serviceId, month)
  const { slots: daySlots, loading: dayLoading } = useSlotsForDate(serviceId, selectedDate)

  const handleContinue = () => {
    if (!selectedSlot) return
    const params = new URLSearchParams({
      serviceId,
      slotId: selectedSlot.id,
    })
    router.push(`/booking/confirm?${params.toString()}`)
  }

  return (
    <div>
      <BookingSteps currentStep={2} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Escolha a data e horário</h1>
      <p className="mb-6 text-sm text-gray-500">
        Dias com ponto indicam disponibilidade. Selecione um dia e depois o horário.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Data</p>
          <DatePicker
            slots={monthSlots}
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              setSelectedDate(date)
              setSelectedSlot(null)
            }}
            month={month}
            onMonthChange={setMonth}
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">
            {selectedDate ? 'Horários disponíveis' : 'Selecione uma data primeiro'}
          </p>
          {selectedDate ? (
            <TimeSlotList
              slots={daySlots}
              loading={dayLoading}
              selectedSlotId={selectedSlot?.id ?? null}
              onSlotSelect={setSelectedSlot}
            />
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 py-12">
              <p className="text-sm text-gray-400">Nenhuma data selecionada</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
        <Button onClick={handleContinue} disabled={!selectedSlot}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
