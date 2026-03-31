'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Profile } from '@/types/app.types'

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('full_name')
      .then(({ data }) => {
        setClients((data as Profile[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>

      <input
        type="text"
        placeholder="Buscar por nome ou telefone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-full max-w-xs rounded-lg border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Telefone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Membro desde
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                      {client.full_name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{client.full_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.phone ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
