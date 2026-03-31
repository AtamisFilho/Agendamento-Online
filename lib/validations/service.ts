import { z } from 'zod'

export const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  duration_minutes: z
    .number({ error: 'Duração deve ser um número' })
    .int()
    .min(5, 'Duração mínima é 5 minutos')
    .max(480, 'Duração máxima é 8 horas'),
  price_cents: z
    .number({ error: 'Preço inválido' })
    .int()
    .min(0, 'Preço não pode ser negativo'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
  is_active: z.boolean(),
})

export const slotSchema = z.object({
  service_id: z.string().uuid().nullable().optional(),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }),
  recurrence: z.enum(['none', 'daily', 'weekly']),
  recurrence_end: z.string().date().optional().nullable(),
  max_bookings: z.number().int().min(1).max(100),
})

export type ServiceInput = z.infer<typeof serviceSchema>
export type SlotInput = z.infer<typeof slotSchema>
