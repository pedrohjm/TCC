import { z } from 'zod'

export const formasPagamento = ['DINHEIRO', 'CARTAO', 'PIX'] as const

export const criarVendaSchema = z.object({
  formaPagamento: z.enum(formasPagamento),
  reservaId: z.number().int().positive().optional(),
  itens: z
    .array(
      z.object({
        produtoId: z.number().int().positive(),
        quantidade: z.number().int().positive(),
      })
    )
    .min(1, 'A venda precisa ter pelo menos um item'),
})

export type CriarVendaInput = z.infer<typeof criarVendaSchema>

// Correção de dados já lançados: forma de pagamento errada ou reserva
// vinculada por engano. Trocar os itens de uma venda existente não é
// suportado por aqui de propósito — o mais simples e claro é apagar a venda
// e lançar de novo (ver DELETE /api/vendas/[id]).
export const atualizarVendaSchema = z.object({
  formaPagamento: z.enum(formasPagamento).optional(),
  reservaId: z.number().int().positive().nullable().optional(),
})

export type AtualizarVendaInput = z.infer<typeof atualizarVendaSchema>
