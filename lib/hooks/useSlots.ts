'use client'

import { useEffect, useState } from 'react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { AvailabilitySlot } from '@/types/app.types'

export function useSlots(serviceId: string | null, month: Date) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!serviceId) {
      setSlots([])
      setLoading(false)
      return
    }

    const fetchSlots = async () => {
      setLoading(true)

      const from = startOfMonth(month).toISOString()
      const to = endOfMonth(month).toISOString()

      const { data } = await supabase
        .from('availability_slots')
        .select(`
          *,
          bookings_count:appointments(count)
        `)
        .or(`service_id.eq.${serviceId},service_id.is.null`)
        .eq('is_active', true)
        .gte('starts_at', from)
        .lte('starts_at', to)
        .order('starts_at')

      // Filter out fully booked slots
      const available = (data ?? []).filter((slot: AvailabilitySlot & { bookings_count: { count: number }[] }) => {
        const booked = slot.bookings_count?.[0]?.count ?? 0
        return booked < slot.max_bookings
      })

      setSlots(available as AvailabilitySlot[])
      setLoading(false)
    }

    fetchSlots()
  }, [serviceId, format(month, 'yyyy-MM')])

  return { slots, loading }
}

export function useSlotsForDate(serviceId: string | null, date: Date | null) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([])
      return
    }

    const fetchSlots = async () => {
      setLoading(true)

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const { data } = await supabase
        .from('availability_slots')
        .select(`
          *,
          bookings_count:appointments(count)
        `)
        .or(`service_id.eq.${serviceId},service_id.is.null`)
        .eq('is_active', true)
        .gte('starts_at', dayStart.toISOString())
        .lte('starts_at', dayEnd.toISOString())
        .order('starts_at')

      const available = (data ?? []).filter((slot: AvailabilitySlot & { bookings_count: { count: number }[] }) => {
        const booked = slot.bookings_count?.[0]?.count ?? 0
        return booked < slot.max_bookings
      })

      setSlots(available as AvailabilitySlot[])
      setLoading(false)
    }

    fetchSlots()
  }, [serviceId, date?.toDateString()])

  return { slots, loading }
}
