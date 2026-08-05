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

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <form
        action={autenticar}
        className="w-full max-w-sm space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-gray-900">Entrar</h1>

        {erro && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            E-mail ou senha inválidos.
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="senha" className="text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Entrar
        </button>
      </form>
    </main>
  )
}
