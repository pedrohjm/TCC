'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PackageX, Settings, ShoppingCart, Store } from 'lucide-react'
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
import { MenuMobile } from '@/components/MenuMobile'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

interface AppSidebarProps {
  papel: 'DONO' | 'ATENDENTE' | null
}

// A logo e o login ficam na barra do topo (app/layout.tsx), não aqui —
// este componente é só a navegação. No desktop é o painel lateral
// (collapsible="none": o <Sidebar> padrão do shadcn é "position: fixed"
// preso na borda do navegador, o que impediria ele de ser um painel
// separado dentro do quadro central). No mobile é o MenuMobile (barra
// flutuante fixa embaixo da tela, ver components/MenuMobile.tsx).
export function AppSidebar({ papel }: AppSidebarProps) {
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  if (isMobile) {
    return <MenuMobile papel={papel} />
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

        <SidebarGroup>
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/estabelecimento" />}
                  isActive={pathname === '/estabelecimento'}
                >
                  <Store />
                  <span>Estabelecimento</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                {/* Fica em "Operação" (qualquer papel), não em "Gestão":
                    quem vê o sabor acabar é quem está no balcão. */}
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/estoque" />} isActive={pathname === '/estoque'}>
                    <PackageX />
                    <span>Falta no estoque</span>
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
