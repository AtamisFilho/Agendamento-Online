'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null)
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      setServerError('Não foi possível redefinir a senha. Tente novamente.')
      return
    }

    router.push('/login')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Nova senha</h2>
        <p className="mt-1 text-sm text-gray-500">Escolha uma nova senha para sua conta.</p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}

      <Input
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 6 caracteres"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar nova senha"
        type="password"
        autoComplete="new-password"
        placeholder="Repita a nova senha"
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />

      <Button type="submit" loading={isSubmitting} className="w-full">
        Redefinir senha
      </Button>
    </form>
  )
}
