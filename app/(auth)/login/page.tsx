import { AuthError } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { CampoSenha, CampoTexto } from '@/components/CamposAuth'
import { MolduraAuth } from '@/components/MolduraAuth'
import { mensagemErroAuth } from '@/lib/validations/auth'

async function autenticar(formData: FormData) {
  'use server'

  try {
    await signIn('credentials', {
      email: formData.get('email'),
      senha: formData.get('senha'),
      redirectTo: '/',
    })
  } catch (erro) {
    if (erro instanceof AuthError) {
      redirect('/login?erro=credenciais')
    }
    // signIn também usa exceção pra redirecionar em caso de sucesso — deixa
    // essa passar, só tratamos erro de autenticação aqui.
    throw erro
  }
}

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams
  const mensagem = mensagemErroAuth(erro)

  return (
    <MolduraAuth
      titulo="Bem-vindo(a) de volta"
      subtitulo="Entre com sua conta para registrar vendas."
      rodape={
        <>
          Ainda não tem conta?{' '}
          <Link href="/registrar" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form action={autenticar} className="space-y-4">
        {mensagem && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {mensagem}
          </p>
        )}

        <CampoTexto
          id="email"
          name="email"
          rotulo="E-mail"
          tipo="email"
          placeholder="seu@email.com"
          autoComplete="email"
        />

        <CampoSenha
          id="senha"
          name="senha"
          rotulo="Senha"
          placeholder="Sua senha"
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Entrar
        </button>
      </form>
    </MolduraAuth>
  )
}
