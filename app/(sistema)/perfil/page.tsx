import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { atualizarPerfilSchema } from '@/lib/validations/perfil'

async function atualizarPerfil(formData: FormData) {
  'use server'

  const sessao = await auth()
  if (!sessao?.user) {
    redirect('/login')
  }

  const resultado = atualizarPerfilSchema.safeParse({
    nome: formData.get('nome'),
    senhaAtual: formData.get('senhaAtual') || undefined,
    senhaNova: formData.get('senhaNova') || undefined,
    confirmarSenha: formData.get('confirmarSenha') || undefined,
  })

  if (!resultado.success) {
    const mensagem = resultado.error.issues[0]?.message ?? 'Dados inválidos'
    redirect(`/perfil?erro=${encodeURIComponent(mensagem)}`)
  }

  const { nome, senhaAtual, senhaNova } = resultado.data
  const usuarioId = Number(sessao.user.id)
  const dadosAtualizados: { nome: string; senhaHash?: string } = { nome }

  if (senhaNova) {
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } })
    const senhaValida = await bcrypt.compare(senhaAtual!, usuario.senhaHash)
    if (!senhaValida) {
      redirect('/perfil?erro=Senha atual incorreta')
    }
    dadosAtualizados.senhaHash = await bcrypt.hash(senhaNova, 10)
  }

  await prisma.usuario.update({ where: { id: usuarioId }, data: dadosAtualizados })

  redirect('/perfil?sucesso=1')
}

export default async function PaginaPerfil({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string }>
}) {
  const sessao = await auth()
  const { erro, sucesso } = await searchParams

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col p-6">
      <form
        action={atualizarPerfil}
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        {erro && (
          <p className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>
        )}
        {sucesso && (
          <p className="rounded bg-secondary px-3 py-2 text-sm text-secondary-foreground">
            Perfil atualizado. Se você trocou o nome, ele só aparece no topo da página depois de
            sair e entrar de novo (a sessão guarda o nome desde o login).
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            defaultValue={sessao?.user?.name ?? ''}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            value={sessao?.user?.email ?? ''}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            O e-mail de login não pode ser alterado por aqui.
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-medium">Trocar senha (opcional)</p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="senhaAtual" className="text-sm text-muted-foreground">
                Senha atual
              </label>
              <input
                id="senhaAtual"
                name="senhaAtual"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="senhaNova" className="text-sm text-muted-foreground">
                Nova senha
              </label>
              <input
                id="senhaNova"
                name="senhaNova"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="confirmarSenha" className="text-sm text-muted-foreground">
                Confirmar nova senha
              </label>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary-soft py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-soft/80"
        >
          Salvar
        </button>
      </form>
    </main>
  )
}
