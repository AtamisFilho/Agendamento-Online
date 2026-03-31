export type UserRole = 'client' | 'provider'

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled_by_client'
  | 'cancelled_by_provider'
  | 'completed'
  | 'no_show'

export type NotificationType = 'confirmation' | 'reminder' | 'cancellation' | 'rescheduled'
export type NotificationStatus = 'pending' | 'sent' | 'failed'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price_cents: number
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AvailabilitySlot {
  id: string
  provider_id: string
  service_id: string | null
  starts_at: string
  ends_at: string
  recurrence: 'none' | 'daily' | 'weekly'
  recurrence_end: string | null
  max_bookings: number
  is_active: boolean
  created_at: string
  updated_at: string
  // computed
  bookings_count?: number
}

export interface Appointment {
  id: string
  client_id: string
  provider_id: string
  service_id: string
  slot_id: string | null
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  notes: string | null
  internal_notes: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  // joined
  service?: Service
  client?: Profile
}

export interface CompanySettings {
  id: number
  name: string
  logo_url: string | null
  primary_color: string
  booking_lead_hours: number
  cancellation_hours: number
  reminder_hours: number
  timezone: string
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  updated_at: string
}

export interface AppointmentEmailData {
  clientName: string
  serviceName: string
  startsAt: string
  endsAt: string
  companyName: string
  companyPhone?: string | null
  appointmentId: string
  notes?: string | null
}
