import { auth } from '@/auth'
import { CabecalhoTopo } from '@/components/CabecalhoTopo'
import { MenuMobile } from '@/components/MenuMobile'

// Landing (a home): largura cheia e rolagem normal do documento, ao
// contrário das páginas internas, que ficam na "janela" flutuante com
// menu lateral. O menu do topo aqui leva pras seções da própria página
// (ver components/NavSecoes.tsx); no celular, onde esse menu não cabe,
// continua valendo a barra flutuante de baixo (MenuMobile), que é a
// navegação do resto do site.
export default async function LayoutLanding({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sessao = await auth()

  return (
    <div className="flex min-h-svh flex-col">
      <CabecalhoTopo comNavSecoes fixo largura="landing" />
      {/* pb-28 no mobile: espaço pro MenuMobile (fixed bottom-4) não
          cobrir o fim da página. */}
      <main className="flex-1 pb-28 md:pb-0">{children}</main>
      {/* O MenuMobile é `fixed`, e aqui não passa pelo AppSidebar (que era
          quem decidia mobile x desktop), então o md:hidden vem no wrapper. */}
      <div className="md:hidden">
        <MenuMobile papel={sessao?.user?.papel ?? null} />
      </div>
    </div>
  )
}
