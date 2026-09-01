import { z } from 'zod'

export const formasPagamento = ['DINHEIRO', 'CARTAO', 'PIX'] as const

/** Teto do valor digitado no self-service. Não é regra de negócio, é
 *  freio de digitação: um pote de sorvete não passa disso, e sem limite um
 *  dedo escorregado no teclado numérico vira uma venda de milhões no
 *  faturamento. */
export const VALOR_LIVRE_MAXIMO = 9999.99

export const criarVendaSchema = z.object({
  formaPagamento: z.enum(formasPagamento),
  reservaId: z.number().int().positive().optional(),
  /** Anotação do balcão sobre o pedido inteiro. */
  descricao: z.string().trim().max(500, 'A descrição está longa demais').optional(),
  itens: z
    .array(
      z.object({
        produtoId: z.number().int().positive(),
        quantidade: z.number().int().positive(),
        /** Só pros produtos de preço LIVRE (self-service, vendido por
         *  peso): o valor digitado no balcão. É a única parcela do preço
         *  que vem do navegador — nos outros produtos o servidor pega tudo
         *  do banco. A rota confere se o produto realmente é LIVRE antes
         *  de aceitar. */
        valor: z.number().positive().max(VALOR_LIVRE_MAXIMO).optional(),
      })
    )
    .min(1, 'A venda precisa ter pelo menos um item'),
})

export type CriarVendaInput = z.infer<typeof criarVendaSchema>

// Correção de dados já lançados: forma de pagamento errada, reserva
// vinculada por engano ou a descrição. Trocar os itens de uma venda
// existente não é suportado por aqui de propósito — o mais simples e claro
// é apagar a venda e lançar de novo (ver DELETE /api/vendas/[id]).
export const atualizarVendaSchema = z.object({
  formaPagamento: z.enum(formasPagamento).optional(),
  reservaId: z.number().int().positive().nullable().optional(),
  descricao: z.string().trim().max(500).nullable().optional(),
})

export type AtualizarVendaInput = z.infer<typeof atualizarVendaSchema>
