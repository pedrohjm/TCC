import { z } from 'zod'

export const regrasPreco = ['UNITARIO', 'ESCALONADO', 'PACOTE', 'LIVRE'] as const

// Campos da regra de preço (ver enum RegraPreco no schema). Ficam
// opcionais: produto sem nada disso é UNITARIO, o caso comum.
const camposRegra = {
  regraPreco: z.enum(regrasPreco).optional(),
  quantidadeRegra: z.number().int().positive().nullable().optional(),
  precoRegra: z.number().positive().nullable().optional(),
  grupoPreco: z.string().trim().min(1).nullable().optional(),
}

// Regras que não dá pra expressar campo a campo:
// - só o preço LIVRE (self-service) pode ter preço de tabela zero, porque
//   nele o valor é digitado na venda;
// - ESCALONADO e PACOTE não significam nada sem a quantidade e o preço da
//   regra — deixar passar criaria um produto que cobra sempre o avulso e
//   ninguém entenderia por quê.
function validarRegra(
  dados: {
    preco?: number
    regraPreco?: (typeof regrasPreco)[number]
    quantidadeRegra?: number | null
    precoRegra?: number | null
  },
  ctx: z.RefinementCtx
) {
  const regra = dados.regraPreco ?? 'UNITARIO'

  if (dados.preco !== undefined && dados.preco <= 0 && regra !== 'LIVRE') {
    ctx.addIssue({
      code: 'custom',
      path: ['preco'],
      message: 'O preço precisa ser maior que zero (só o preço LIVRE pode ser zero)',
    })
  }

  if (regra === 'ESCALONADO' || regra === 'PACOTE') {
    if (!dados.quantidadeRegra) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantidadeRegra'],
        message: `A regra ${regra} precisa da quantidade`,
      })
    }
    if (dados.precoRegra === undefined || dados.precoRegra === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['precoRegra'],
        message: `A regra ${regra} precisa do preço`,
      })
    }
  }
}

export const criarProdutoSchema = z
  .object({
    nome: z.string().trim().min(1, 'Informe o nome do produto'),
    preco: z.number().nonnegative('O preço não pode ser negativo'),
    ativo: z.boolean().optional(),
    ordem: z.number().int().nonnegative().optional(),
    ...camposRegra,
  })
  .superRefine(validarRegra)

export type CriarProdutoInput = z.infer<typeof criarProdutoSchema>

export const atualizarProdutoSchema = z
  .object({
    nome: z.string().trim().min(1).optional(),
    preco: z.number().nonnegative().optional(),
    ativo: z.boolean().optional(),
    ordem: z.number().int().nonnegative().optional(),
    ...camposRegra,
  })
  .superRefine(validarRegra)

export type AtualizarProdutoInput = z.infer<typeof atualizarProdutoSchema>
