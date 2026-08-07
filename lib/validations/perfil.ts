import { z } from 'zod'

// senhaNova opcional: o usuário pode só atualizar o nome sem mexer na
// senha. Quando ele preenche senhaNova, exige senhaAtual (checada contra o
// hash no banco, não dá pra validar isso aqui) e a confirmação batendo.
export const atualizarPerfilSchema = z
  .object({
    nome: z.string().trim().min(1, 'Informe seu nome'),
    senhaAtual: z.string().optional(),
    senhaNova: z.string().min(6, 'A nova senha precisa ter pelo menos 6 caracteres').optional(),
    confirmarSenha: z.string().optional(),
  })
  .refine((dados) => !dados.senhaNova || dados.senhaAtual, {
    message: 'Informe a senha atual para trocar de senha',
    path: ['senhaAtual'],
  })
  .refine((dados) => !dados.senhaNova || dados.senhaNova === dados.confirmarSenha, {
    message: 'A confirmação não bate com a nova senha',
    path: ['confirmarSenha'],
  })

export type AtualizarPerfilInput = z.infer<typeof atualizarPerfilSchema>
