import { z } from 'zod'

export const createAppointmentSchema = z.object({
  service_id: z.string().uuid('Serviço inválido'),
  slot_id: z.string().uuid('Horário inválido'),
  notes: z.string().max(500, 'Observação muito longa').optional(),
})

export const cancelAppointmentSchema = z.object({
  cancellation_reason: z.string().max(300, 'Motivo muito longo').optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>
