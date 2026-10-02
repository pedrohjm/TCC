import { z } from 'zod'
import { formasPagamento } from '@/lib/validations/venda'

export const tiposEncomenda = ['POTE', 'CAIXA'] as const
export const statusEncomenda = ['PENDENTE', 'FEITO', 'ENTREGUE'] as const

export type TipoEncomendaValor = (typeof tiposEncomenda)[number]
export type StatusEncomendaValor = (typeof statusEncomenda)[number]

/** Teto de quantidade. Não é regra de negócio, é freio de digitação: uma
 *  encomenda de 500 potes é dedo escorregado no teclado, não pedido. */
export const QUANTIDADE_MAXIMA = 200

export const criarEncomendaSchema = z.object({
  nomeCliente: z.string().trim().min(1, 'Informe o nome do cliente'),
  saborId: z.number().int().positive('Escolha o sabor'),
  tipo: z.enum(tiposEncomenda),
  quantidade: z.number().int().positive().max(QUANTIDADE_MAXIMA).default(1),
  dataEntrega: z.coerce.date('Data inválida'),
  observacao: z.string().trim().max(500, 'A observação está longa demais').optional(),
  // O status NÃO vem daqui: toda encomenda nasce PENDENTE (ver o POST em
  // app/api/encomendas/route.ts). Deixar escolher na criação só abriria
  // espaço pra registrar como "entregue" algo que nunca foi feito.
})

export type CriarEncomendaInput = z.infer<typeof criarEncomendaSchema>

export const atualizarEncomendaSchema = z
  .object({
    nomeCliente: z.string().trim().min(1).optional(),
    saborId: z.number().int().positive().optional(),
    tipo: z.enum(tiposEncomenda).optional(),
    quantidade: z.number().int().positive().max(QUANTIDADE_MAXIMA).optional(),
    dataEntrega: z.coerce.date('Data inválida').optional(),
    status: z.enum(statusEncomenda).optional(),
    observacao: z.string().trim().max(500).nullable().optional(),
    /** Só na passagem pra ENTREGUE: entregar gera a venda, e venda sem
     *  forma de pagamento não existe. Nos outros casos não é aceito. */
    formaPagamento: z.enum(formasPagamento).optional(),
  })
  .superRefine((dados, ctx) => {
    if (dados.status === 'ENTREGUE' && !dados.formaPagamento) {
      ctx.addIssue({
        code: 'custom',
        path: ['formaPagamento'],
        message: 'Entregar gera a venda — informe a forma de pagamento',
      })
    }
    if (dados.formaPagamento && dados.status !== 'ENTREGUE') {
      ctx.addIssue({
        code: 'custom',
        path: ['formaPagamento'],
        message: 'Forma de pagamento só vale ao marcar como entregue',
      })
    }
  })

export type AtualizarEncomendaInput = z.infer<typeof atualizarEncomendaSchema>
