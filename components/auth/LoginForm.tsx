'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('E-mail ou senha incorretos.')
      return
    }

    router.push('/booking')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Entrar</h2>
        <p className="mt-1 text-sm text-gray-500">Bem-vindo de volta!</p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}

      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Senha"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Esqueceu a senha?
        </Link>
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full">
        Entrar
      </Button>

      <p className="text-center text-sm text-gray-500">
        Não tem conta?{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
          Cadastre-se
        </Link>
      </p>
    </form>
  )
}
