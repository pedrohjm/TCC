'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings, ShoppingCart } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { GradientMenu, type GradientMenuItem } from '@/components/ui/gradient-menu'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

interface AppSidebarProps {
  papel: 'DONO' | 'ATENDENTE' | null
}

// A logo e o login ficam na barra do topo (app/layout.tsx), não aqui —
// este componente é só a navegação. No desktop é o painel lateral
// (collapsible="none": o <Sidebar> padrão do shadcn é "position: fixed"
// preso na borda do navegador, o que impediria ele de ser um painel
// separado dentro do quadro central). No mobile não tem mais gaveta —
// vira uma barra flutuante fixa embaixo da tela, no estilo "gradient
// menu" (bolinhas com ícone que viram pílulas com gradiente ao tocar).
export function AppSidebar({ papel }: AppSidebarProps) {
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  if (isMobile) {
    const itensMobile: GradientMenuItem[] = [
      ...ITENS_CARDAPIO.map((item, indice) => {
        const href = `/cardapio/${item.slug}`
        const gradientes = [
          ['#f9a8d4', '#ec4899'],
          ['#c4b5fd', '#8b5cf6'],
          ['#7dd3fc', '#0ea5e9'],
          ['#fde68a', '#f59e0b'],
          ['#6ee7b7', '#10b981'],
        ]
        const [gradienteDe, gradienteAte] = gradientes[indice % gradientes.length]
        return {
          titulo: item.titulo,
          icone: item.icone,
          href,
          gradienteDe,
          gradienteAte,
          ativo: pathname === href,
        }
      }),
      ...(papel
        ? [
            {
              titulo: 'Venda',
              icone: ShoppingCart,
              href: '/vendas',
              gradienteDe: '#fda4af',
              gradienteAte: '#e11d48',
              ativo: pathname === '/vendas',
            },
          ]
        : []),
      ...(papel === 'DONO'
        ? [
            {
              titulo: 'Painel',
              icone: LayoutDashboard,
              href: '/dashboard',
              gradienteDe: '#a5b4fc',
              gradienteAte: '#6366f1',
              ativo: pathname === '/dashboard',
            },
          ]
        : []),
    ]

    return (
      <nav className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="max-w-full overflow-x-auto rounded-full bg-background/90 p-2 shadow-xl ring-1 ring-border backdrop-blur-sm">
          <GradientMenu itens={itensMobile} />
        </div>
      </nav>
    )
  }

  return (
    <Sidebar
      collapsible="none"
      className="hidden w-[252px] shrink-0 overflow-hidden rounded-xl border border-border/70 shadow-lg md:flex"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border/70 bg-gradient-to-r from-primary/85 via-primary to-primary/85 px-4 py-2 text-primary-foreground">
        <Settings className="h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold tracking-wide">Menu</p>
          <p className="text-[0.65rem] text-primary-foreground/80">Q10 Sorvetes</p>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Cardápio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITENS_CARDAPIO.map((item) => {
                const href = `/cardapio/${item.slug}`
                const Icone = item.icone
                return (
                  <SidebarMenuItem key={item.slug}>
                    <SidebarMenuButton render={<Link href={href} />} isActive={pathname === href}>
                      <Icone />
                      <span>{item.titulo}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {papel && (
          <SidebarGroup>
            <SidebarGroupLabel>Operação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/vendas" />} isActive={pathname === '/vendas'}>
                    <ShoppingCart />
                    <span>Registrar venda</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {papel === 'DONO' && (
          <SidebarGroup>
            <SidebarGroupLabel>Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard" />}
                    isActive={pathname === '/dashboard'}
                  >
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
