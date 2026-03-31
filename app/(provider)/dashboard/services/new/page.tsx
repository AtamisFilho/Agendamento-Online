'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { ServiceForm } from '@/components/dashboard/ServiceForm'
import type { ServiceInput } from '@/lib/validations/service'

export default function NewServicePage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (data: ServiceInput) => {
    await supabase.from('services').insert(data)
    router.push('/dashboard/services')
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/services" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Novo serviço</h1>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ServiceForm onSubmit={handleSubmit} onCancel={() => router.push('/dashboard/services')} />
      </div>
    </div>
  )
}
