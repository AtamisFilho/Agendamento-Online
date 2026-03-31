'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/app.types'
import type { User } from '@supabase/supabase-js'

interface UserState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

export function useUser(): UserState {
  const [state, setState] = useState<UserState>({ user: null, profile: null, loading: true })
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setState({ user: null, profile: null, loading: false })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setState({ user, profile: profile as Profile | null, loading: false })
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
