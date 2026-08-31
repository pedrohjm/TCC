import { auth } from '@/auth'
import { CabecalhoTopo } from '@/components/CabecalhoTopo'
import { MenuMobile } from '@/components/MenuMobile'

// Páginas de quem trabalha na loja (`/painel` e `/perfil`). Mesmo formato
// da landing — largura cheia, quem rola é o documento —, sem o menu de
// seções da barra do topo, que só existe na home (lá os links são âncoras
// da própria página).
//
// Substitui o antigo `app/(janela)/`, o formato de janela flutuante com
// menu lateral.
export default async function LayoutSistema({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sessao = await auth()

  return (
    <div className="flex min-h-svh flex-col">
      <CabecalhoTopo />
      {/* pb-28 no mobile: espaço pro MenuMobile (fixed bottom-4) não
          cobrir o fim da página. */}
      <main className="flex-1 pb-28 md:pb-0">{children}</main>
      {/* O MenuMobile é `fixed` e não tem breakpoint próprio, então o
          md:hidden vem no wrapper. */}
      <div className="md:hidden">
        <MenuMobile papel={sessao?.user?.papel ?? null} />
      </div>
    </div>
  )
}
