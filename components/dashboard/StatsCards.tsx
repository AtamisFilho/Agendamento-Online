'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Clock, XCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays } from 'date-fns'
import { Spinner } from '@/components/ui/Spinner'

interface Stats {
  today: number
  thisWeek: number
  pending: number
  completionRate: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const now = new Date()

      const [{ count: today }, { count: thisWeek }, { count: pending }, { data: last30 }] =
        await Promise.all([
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .gte('starts_at', startOfDay(now).toISOString())
            .lte('starts_at', endOfDay(now).toISOString()),
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .gte('starts_at', startOfWeek(now, { weekStartsOn: 0 }).toISOString())
            .lte('starts_at', endOfWeek(now, { weekStartsOn: 0 }).toISOString()),
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase
            .from('appointments')
            .select('status')
            .gte('starts_at', subDays(now, 30).toISOString())
            .in('status', ['completed', 'confirmed', 'no_show', 'cancelled_by_client', 'cancelled_by_provider']),
        ])

      const total30 = last30?.length ?? 0
      const completed30 = last30?.filter((a) => a.status === 'completed').length ?? 0
      const completionRate = total30 > 0 ? Math.round((completed30 / total30) * 100) : 0

      setStats({
        today: today ?? 0,
        thisWeek: thisWeek ?? 0,
        pending: pending ?? 0,
        completionRate,
      })
    }
    fetch()
  }, [])

  const cards = [
    {
      label: 'Hoje',
      value: stats?.today ?? 0,
      icon: CalendarDays,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Esta semana',
      value: stats?.thisWeek ?? 0,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pendentes',
      value: stats?.pending ?? 0,
      icon: XCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Taxa de conclusão (30d)',
      value: `${stats?.completionRate ?? 0}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                {stats ? (
                  <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                ) : (
                  <div className="mt-2">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>
              <div className={`rounded-xl p-2.5 ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
