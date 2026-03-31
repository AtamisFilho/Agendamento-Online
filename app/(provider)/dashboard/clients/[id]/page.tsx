'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppointmentCard } from '@/components/appointments/AppointmentCard'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Profile, Appointment } from '@/types/app.types'

interface Props {
  params: Promise<{ id: string }>
}

export default function ClientDetailPage({ params }: Props) {
  const { id } = use(params)
  const supabase = createClient()
  const [client, setClient] = useState<Profile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase
        .from('appointments')
        .select('*, service:services(*)')
        .eq('client_id', id)
        .order('starts_at', { ascending: false }),
    ]).then(([{ data: profile }, { data: appts }]) => {
      setClient(profile as Profile | null)
      setAppointments((appts as Appointment[]) ?? [])
      setLoading(false)
    })
  }, [id])

  if (loading) return <PageSpinner />
  if (!client) return <p>Cliente não encontrado.</p>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard/clients" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
            {client.full_name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{client.full_name}</p>
            {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
            <p className="text-xs text-gray-400">
              Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          Histórico de agendamentos ({appointments.length})
        </h2>
        {appointments.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum agendamento.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
