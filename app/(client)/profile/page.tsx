'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUser } from '@/lib/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { useState } from 'react'

const profileSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().optional(),
})

type ProfileInput = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, profile, loading } = useUser()
  const supabase = createClient()
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (profile) {
      reset({ full_name: profile.full_name, phone: profile.phone ?? '' })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileInput) => {
    setServerError(null)
    setSaved(false)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: data.full_name, phone: data.phone ?? null })
      .eq('id', user!.id)

    if (error) {
      setServerError('Erro ao salvar. Tente novamente.')
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <PageSpinner />

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Meu perfil</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile?.full_name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {saved && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Perfil atualizado com sucesso!
            </div>
          )}
          {serverError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
          )}

          <Input
            label="Nome completo"
            type="text"
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            label="E-mail"
            type="email"
            value={user?.email ?? ''}
            disabled
            hint="O e-mail não pode ser alterado"
          />

          <Input
            label="Telefone (opcional)"
            type="tel"
            placeholder="(11) 99999-9999"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Button type="submit" loading={isSubmitting}>
            Salvar alterações
          </Button>
        </form>
      </div>
    </div>
  )
}
