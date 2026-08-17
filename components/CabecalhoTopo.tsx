import Link from 'next/link'
import { UserCog } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { LogoBandeira } from '@/components/LogoBandeira'
import { NavSecoes } from '@/components/NavSecoes'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

async function sair() {
  'use server'
  await signOut({ redirectTo: '/login' })
}

interface CabecalhoTopoProps {
  /** Mostra a navegação por seções (só faz sentido na landing, onde as
   *  seções existem na mesma página). */
  comNavSecoes?: boolean
  /** Na landing o cabeçalho acompanha a rolagem; nas outras páginas quem
   *  rola é o painel interno, então ele já fica fixo naturalmente. */
  fixo?: boolean
  /** Largura do conteúdo: o quadro estreito das páginas internas ou a
   *  largura maior da landing. */
  largura?: 'quadro' | 'landing'
}

// Barra do topo, compartilhada pela landing e pelas páginas internas —
// a diferença entre as duas é só o menu de seções e a largura.
export async function CabecalhoTopo({
  comNavSecoes = false,
  fixo = false,
  largura = 'quadro',
}: CabecalhoTopoProps) {
  const sessao = await auth()

  return (
    <header
      className={cn(
        'z-40 border-b border-black/10 bg-sidebar/90 backdrop-blur-sm dark:border-white/10',
        fixo ? 'sticky top-0' : 'shrink-0'
      )}
    >
      {/* Mesmo max-w + px-4 do conteúdo abaixo, pra a logo alinhar com a
          borda esquerda do que vem embaixo em vez de ficar colada na
          borda da janela do navegador. */}
      <div
        className={cn(
          'mx-auto flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2',
          largura === 'landing' ? 'max-w-6xl' : 'max-w-[1080px]'
        )}
      >
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
