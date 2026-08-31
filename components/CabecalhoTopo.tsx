import Link from 'next/link'
import { LayoutDashboard, ShoppingCart, UserCog } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { LogoBandeira } from '@/components/LogoBandeira'
import { NavSecoes } from '@/components/NavSecoes'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'

async function sair() {
  'use server'
  await signOut({ redirectTo: '/login' })
}

interface CabecalhoTopoProps {
  /** Mostra a navegação por seções. Só faz sentido na home: lá os links
   *  são âncoras de seções da própria página. */
  comNavSecoes?: boolean
}

// Barra do topo, a mesma na home e no painel da equipe. Fica grudada no
// topo nas duas (quem rola é o documento, não um painel interno como no
// formato antigo de janela).
export async function CabecalhoTopo({ comNavSecoes = false }: CabecalhoTopoProps) {
  const sessao = await auth()
  const papel = sessao?.user?.papel ?? null

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-sidebar/90 backdrop-blur-sm dark:border-white/10">
      {/* Mesmo max-w + px-4 do conteúdo abaixo, pra a logo alinhar com a
          borda esquerda do que vem embaixo em vez de ficar colada na
          borda da janela do navegador. */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2">
        <Link href="/" className="flex shrink-0 items-center py-1" aria-label="Q10 Sorvetes">
          <LogoBandeira />
        </Link>

        {/* No celular o menu de seções não cabe na mesma linha da logo:
            `order-last w-full` joga ele pra uma segunda linha (que rola na
            horizontal); a partir de md ele volta pro meio da barra. */}
        {comNavSecoes && (
          <div className="order-last w-full md:order-none md:w-auto">
            <NavSecoes />
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {sessao?.user ? (
            <>
              {/* Só o nome — sem o papel (DONO/ATENDENTE) do lado, não é
                  uma informação que o usuário precisa ver aqui. */}
              <span className="hidden text-sm text-muted-foreground lg:inline">
                {sessao.user.name}
              </span>

              {/* Atalhos de equipe: levam direto pra categoria certa do
                  painel. Sem eles, quem entra e cai na home no computador
                  não teria como chegar no sistema — a barra de baixo do
                  celular some a partir de md. */}
              {papel && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  render={<Link href="/painel?secao=vendas" />}
                  aria-label="Registrar venda"
                  title="Registrar venda"
                >
                  <ShoppingCart />
                </Button>
              )}
              {papel === 'DONO' && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  render={<Link href="/painel?secao=dashboard" />}
                  aria-label="Dashboard"
                  title="Dashboard"
                >
                  <LayoutDashboard />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={<Link href="/perfil" />}
                aria-label="Editar perfil"
              >
                <UserCog />
              </Button>
              <form action={sair}>
                <Button type="submit" variant="outline" size="sm">
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
