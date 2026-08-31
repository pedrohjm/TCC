import { z } from 'zod'

// Cadastro de novo usuário pela tela /registrar.
//
// ATENÇÃO — o papel NÃO vem daqui: quem se cadastra sai sempre como
// ATENDENTE (ver a action em app/(auth)/registrar/page.tsx). Deixar o
// papel vir do formulário permitiria qualquer um se cadastrar como DONO e
// abrir o faturamento da loja no dashboard.
export const registrarSchema = z
  .object({
    nome: z.string().trim().min(1, 'Informe seu nome'),
    email: z.email('E-mail inválido').trim().toLowerCase(),
    senha: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: 'A confirmação não bate com a senha',
    path: ['confirmarSenha'],
  })

export type RegistrarInput = z.infer<typeof registrarSchema>

// Códigos de erro que viajam na URL (?erro=...). Mesmo padrão que o login
// já usava — a mensagem em si fica na tela, não na barra de endereço.
export const ERROS_AUTH = {
  credenciais: 'E-mail ou senha inválidos.',
  invalido: 'Confira os dados: e-mail válido e senha com pelo menos 6 caracteres.',
  'senha-diferente': 'A confirmação não bate com a senha.',
  'email-em-uso': 'Já existe uma conta com esse e-mail.',
} as const

export type CodigoErroAuth = keyof typeof ERROS_AUTH

export function mensagemErroAuth(codigo: string | undefined): string | null {
  if (!codigo) return null
  return ERROS_AUTH[codigo as CodigoErroAuth] ?? 'Não foi possível concluir. Tente de novo.'
}
