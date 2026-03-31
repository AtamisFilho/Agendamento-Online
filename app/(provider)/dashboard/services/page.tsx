'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDuration } from '@/lib/utils/formatters'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Service } from '@/types/app.types'

export default function ServicesPage() {
  const supabase = createClient()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('name')
    setServices((data as Service[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const toggleActive = async (service: Service) => {
    await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)
    fetchServices()
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <Link href="/dashboard/services/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Novo serviço
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
          Nenhum serviço cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Serviço
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Duração
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Preço
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDuration(service.duration_minutes)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatCurrency(service.price_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(service)}
                      className="flex items-center gap-1 text-sm"
                    >
                      {service.is_active ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-green-500" />
                          <span className="text-green-600">Ativo</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400">Inativo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/services/${service.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
