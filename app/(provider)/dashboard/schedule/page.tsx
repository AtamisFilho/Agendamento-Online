'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { SlotForm } from '@/components/dashboard/SlotForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatTime } from '@/lib/utils/formatters'
import type { AvailabilitySlot } from '@/types/app.types'
import type { SlotInput } from '@/lib/validations/service'

export default function SchedulePage() {
  const supabase = createClient()
  const { user } = useUser()
  const [month, setMonth] = useState(new Date())
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [formOpen, setFormOpen] = useState(false)

  const fetchSlots = async () => {
    const { data } = await supabase
      .from('availability_slots')
      .select('*')
      .gte('starts_at', startOfMonth(month).toISOString())
      .lte('starts_at', endOfMonth(month).toISOString())
      .order('starts_at')
    setSlots((data as AvailabilitySlot[]) ?? [])
  }

  useEffect(() => {
    fetchSlots()
  }, [month])

  const handleCreateSlot = async (data: SlotInput) => {
    if (!user) return
    await supabase.from('availability_slots').insert({
      ...data,
      provider_id: user.id,
      service_id: data.service_id || null,
    })
    setFormOpen(false)
    fetchSlots()
  }

  const handleDeleteSlot = async (id: string) => {
    await supabase.from('availability_slots').update({ is_active: false }).eq('id', id)
    fetchSlots()
  }

  // Group slots by date
  const slotsByDate = slots.reduce(
    (acc, slot) => {
      const dateKey = format(new Date(slot.starts_at), 'yyyy-MM-dd')
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(slot)
      return acc
    },
    {} as Record<string, AvailabilitySlot[]>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo horário
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-32 text-center font-semibold capitalize text-gray-900">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Slots list */}
      {Object.keys(slotsByDate).length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
          Nenhum horário criado para este mês.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(slotsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateKey, daySlots]) => (
              <div key={dateKey} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                  <p className="text-sm font-semibold capitalize text-gray-700">
                    {format(new Date(dateKey + 'T12:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between px-4 py-3">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
                        </span>
                        <span className="ml-3 text-gray-500">
                          {slot.max_bookings > 1 ? `${slot.max_bookings} vagas` : '1 vaga'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        aria-label="Remover horário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Novo horário">
        <SlotForm onSubmit={handleCreateSlot} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  )
}
