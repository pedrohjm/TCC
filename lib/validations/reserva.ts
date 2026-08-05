import { z } from 'zod'

export const statusReserva = ['PENDENTE', 'CONCLUIDA', 'CANCELADA'] as const

export const criarReservaSchema = z.object({
  nomeCliente: z.string().trim().min(1, 'Informe o nome do cliente'),
  data: z.coerce.date('Data inválida'),
  // Toda reserva nasce PENDENTE — não deixamos o cliente da API escolher o
  // status inicial (ver POST em app/api/reservas/route.ts).
})

export type CriarReservaInput = z.infer<typeof criarReservaSchema>

export const atualizarReservaSchema = z.object({
  nomeCliente: z.string().trim().min(1).optional(),
  data: z.coerce.date('Data inválida').optional(),
  status: z.enum(statusReserva).optional(),
})

export type AtualizarReservaInput = z.infer<typeof atualizarReservaSchema>
