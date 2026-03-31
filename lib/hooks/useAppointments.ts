'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/types/app.types'

export function useAppointments(clientId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAppointments = useCallback(async () => {
    if (!clientId) {
      setAppointments([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select(`*, service:services(*), client:profiles!appointments_client_id_fkey(*)`)
      .eq('client_id', clientId)
      .order('starts_at', { ascending: false })

    setAppointments((data as Appointment[]) ?? [])
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return { appointments, loading, refetch: fetchAppointments }
}

export function useAllAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select(`*, service:services(*), client:profiles!appointments_client_id_fkey(*)`)
      .order('starts_at', { ascending: false })

    setAppointments((data as Appointment[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAppointments()

    // Realtime subscription
    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAppointments])

  return { appointments, loading, refetch: fetchAppointments }
}
