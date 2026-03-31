'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ServiceForm } from '@/components/dashboard/ServiceForm'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Service } from '@/types/app.types'
import type { ServiceInput } from '@/lib/validations/service'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditServicePage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('services').select('*').eq('id', id).single().then(({ data }) => {
      setService(data as Service | null)
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (data: ServiceInput) => {
    await supabase.from('services').update(data).eq('id', id)
    router.push('/dashboard/services')
  }

  if (loading) return <PageSpinner />
  if (!service) return <p>Serviço não encontrado.</p>

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/services" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Editar serviço</h1>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ServiceForm
          defaultValues={service}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/services')}
        />
      </div>
    </div>
  )
}
