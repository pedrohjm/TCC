import { auth } from '@/auth'
import { AppSidebar } from '@/components/AppSidebar'
import { CabecalhoTopo } from '@/components/CabecalhoTopo'
import { TituloPagina } from '@/components/TituloPagina'
import { SidebarProvider } from '@/components/ui/sidebar'

// Formato de "janela" flutuante, do modelo em public/images/modelo
// (taskbarhero.wiki): barra do topo ocupando a largura toda e, abaixo
// dela, dois painéis separados (menu + conteúdo) num quadro estreito e
// centralizado, com o fundo aparecendo nas laterais. As medidas (quadro
// ~1080px, menu 252px, 16px entre os painéis) vieram de medir o site de
// referência.
//
// Aqui quem rola é o painel de conteúdo, não o documento — por isso o
// h-svh + overflow-hidden neste nível (e não no <body>, que a landing
// precisa que role normalmente).
export default async function LayoutJanela({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sessao = await auth()

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <SidebarProvider className="contents">
        <CabecalhoTopo />

        {/* Quadro central: menu e conteúdo são dois painéis separados. */}
        <div className="mx-auto flex min-h-0 w-full max-w-[1080px] flex-1 gap-4 p-4">
          <AppSidebar papel={sessao?.user?.papel ?? null} />

          <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-background shadow-lg">
            <div className="shrink-0 border-b border-border/70 bg-gradient-to-r from-primary/85 via-primary to-primary/85 px-4 py-2 text-center text-sm font-semibold tracking-wide text-primary-foreground">
              <TituloPagina />
            </div>
            {/* pb-24 no mobile: espaço pro menu flutuante (AppSidebar,
                fixed bottom-4) não cobrir o final do conteúdo. */}
            <div className="min-h-0 flex-1 overflow-y-auto pb-24 md:pb-0">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
