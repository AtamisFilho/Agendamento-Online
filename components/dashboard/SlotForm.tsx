'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { slotSchema, type SlotInput } from '@/lib/validations/service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useServices } from '@/lib/hooks/useServices'

interface SlotFormProps {
  defaultDate?: Date
  onSubmit: (data: SlotInput) => Promise<void>
  onCancel?: () => void
}

export function SlotForm({ defaultDate, onSubmit, onCancel }: SlotFormProps) {
  const { services } = useServices()

  const defaultDateStr = defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SlotInput>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      service_id: null,
      starts_at: `${defaultDateStr}T09:00`,
      ends_at: `${defaultDateStr}T09:30`,
      recurrence: 'none',
      max_bookings: 1,
    },
  })

  const recurrence = watch('recurrence')

  const handleFormSubmit = async (data: SlotInput) => {
    // Convert local datetime to ISO
    const startsAt = new Date(data.starts_at).toISOString()
    const endsAt = new Date(data.ends_at).toISOString()
    await onSubmit({ ...data, starts_at: startsAt, ends_at: endsAt })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Serviço (opcional)</label>
        <select
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          {...register('service_id')}
        >
          <option value="">Qualquer serviço</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Início"
          type="datetime-local"
          error={errors.starts_at?.message}
          {...register('starts_at')}
        />
        <Input
          label="Fim"
          type="datetime-local"
          error={errors.ends_at?.message}
          {...register('ends_at')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Recorrência</label>
        <select
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          {...register('recurrence')}
        >
          <option value="none">Sem recorrência</option>
          <option value="daily">Diária</option>
          <option value="weekly">Semanal</option>
        </select>
      </div>

      {recurrence !== 'none' && (
        <Input
          label="Repetir até"
          type="date"
          error={errors.recurrence_end?.message}
          {...register('recurrence_end')}
        />
      )}

      <Input
        label="Vagas disponíveis"
        type="number"
        min={1}
        max={100}
        error={errors.max_bookings?.message}
        {...register('max_bookings', { valueAsNumber: true })}
      />

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Criar horário
        </Button>
      </div>
    </form>
  )
}
