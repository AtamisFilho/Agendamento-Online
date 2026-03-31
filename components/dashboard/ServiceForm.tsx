'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { serviceSchema, type ServiceInput } from '@/lib/validations/service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Service } from '@/types/app.types'

interface ServiceFormProps {
  defaultValues?: Partial<Service>
  onSubmit: (data: ServiceInput) => Promise<void>
  onCancel?: () => void
}

const colorOptions = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
]

export function ServiceForm({ defaultValues, onSubmit, onCancel }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      duration_minutes: defaultValues?.duration_minutes ?? 30,
      price_cents: defaultValues?.price_cents ? defaultValues.price_cents / 100 : 0,
      color: defaultValues?.color ?? '#6366f1',
      is_active: defaultValues?.is_active ?? true,
    },
  })

  const selectedColor = watch('color')

  const handleFormSubmit = async (data: ServiceInput) => {
    // Convert BRL to cents
    await onSubmit({ ...data, price_cents: Math.round(data.price_cents * 100) })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <Input label="Nome" error={errors.name?.message} {...register('name')} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          rows={2}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Duração (minutos)"
          type="number"
          min={5}
          max={480}
          error={errors.duration_minutes?.message}
          {...register('duration_minutes', { valueAsNumber: true })}
        />
        <Input
          label="Preço (R$)"
          type="number"
          min={0}
          step="0.01"
          placeholder="0,00"
          error={errors.price_cents?.message}
          {...register('price_cents', { valueAsNumber: true })}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Cor</p>
        <div className="flex gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          {...register('is_active')}
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Serviço ativo (visível para clientes)
        </label>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Salvar serviço
        </Button>
      </div>
    </form>
  )
}
