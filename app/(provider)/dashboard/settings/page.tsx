'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import type { CompanySettings } from '@/types/app.types'

const settingsSchema = z.object({
  name: z.string().min(2),
  contact_email: z.email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  booking_lead_hours: z.number().int().min(0).max(72),
  cancellation_hours: z.number().int().min(0).max(168),
  reminder_hours: z.number().int().min(1).max(168),
  timezone: z.string(),
})

type SettingsInput = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema) })

  useEffect(() => {
    supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          const s = data as CompanySettings
          reset({
            name: s.name,
            contact_email: s.contact_email ?? '',
            contact_phone: s.contact_phone ?? '',
            address: s.address ?? '',
            booking_lead_hours: s.booking_lead_hours,
            cancellation_hours: s.cancellation_hours,
            reminder_hours: s.reminder_hours,
            timezone: s.timezone,
          })
        }
        setLoading(false)
      })
  }, [])

  const onSubmit = async (data: SettingsInput) => {
    await supabase.from('company_settings').update(data).eq('id', 1)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <PageSpinner />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {saved && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Configurações salvas com sucesso!
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Dados da empresa</h2>
          <Input label="Nome da empresa" error={errors.name?.message} {...register('name')} />
          <Input label="E-mail de contato" type="email" error={errors.contact_email?.message} {...register('contact_email')} />
          <Input label="Telefone de contato" type="tel" {...register('contact_phone')} />
          <Input label="Endereço" {...register('address')} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Regras de agendamento</h2>
          <Input
            label="Antecedência mínima para agendar (horas)"
            type="number"
            min={0}
            max={72}
            hint="Ex.: 2 = cliente precisa agendar com pelo menos 2h de antecedência"
            error={errors.booking_lead_hours?.message}
            {...register('booking_lead_hours', { valueAsNumber: true })}
          />
          <Input
            label="Prazo para cancelamento (horas)"
            type="number"
            min={0}
            max={168}
            hint="Ex.: 24 = cancelamento só é permitido com 24h de antecedência"
            error={errors.cancellation_hours?.message}
            {...register('cancellation_hours', { valueAsNumber: true })}
          />
          <Input
            label="Enviar lembrete (horas antes)"
            type="number"
            min={1}
            max={168}
            hint="Ex.: 24 = lembrete enviado 24h antes do agendamento"
            error={errors.reminder_hours?.message}
            {...register('reminder_hours', { valueAsNumber: true })}
          />
        </div>

        <Button type="submit" loading={isSubmitting}>
          Salvar configurações
        </Button>
      </form>
    </div>
  )
}
