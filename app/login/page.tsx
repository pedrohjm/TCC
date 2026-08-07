import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'

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
      redirect('/login?erro=1')
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

  // min-h-full (e não min-h-screen): a tela de login agora vive dentro do
  // painel de conteúdo, não ocupa a viewport inteira. O título "Entrar" vem
  // da faixa no topo do painel.
  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-6">
      <form
        action={autenticar}
        className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        {erro && (
          <p className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">
            E-mail ou senha inválidos.
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="senha" className="text-sm font-medium">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Entrar
        </button>
      </form>
    </main>
  )
}
