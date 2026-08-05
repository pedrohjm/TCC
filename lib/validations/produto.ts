import { z } from 'zod'

export const criarProdutoSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do produto'),
  preco: z.number().positive('O preço precisa ser maior que zero'),
  ativo: z.boolean().optional(),
})

export type CriarProdutoInput = z.infer<typeof criarProdutoSchema>

export const atualizarProdutoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  preco: z.number().positive().optional(),
  ativo: z.boolean().optional(),
})

export type AtualizarProdutoInput = z.infer<typeof atualizarProdutoSchema>
