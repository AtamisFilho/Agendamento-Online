'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/booking'
  const supabase = createClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone ?? null,
          role: 'client',
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setServerError('Este e-mail já está cadastrado. Tente fazer login.')
      } else {
        setServerError(error.message)
      }
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
        <p className="mt-1 text-sm text-gray-500">Rápido e gratuito</p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}

      <Input
        label="Nome completo"
        type="text"
        autoComplete="name"
        placeholder="João da Silva"
        error={errors.full_name?.message}
        {...register('full_name')}
      />

      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Telefone (opcional)"
        type="tel"
        autoComplete="tel"
        placeholder="(11) 99999-9999"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Input
        label="Senha"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 6 caracteres"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar senha"
        type="password"
        autoComplete="new-password"
        placeholder="Repita a senha"
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />

      <Button type="submit" loading={isSubmitting} className="w-full">
        Criar conta
      </Button>

      <p className="text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Entrar
        </Link>
      </p>
    </form>
  )
}
