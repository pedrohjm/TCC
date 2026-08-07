'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

interface AppSidebarProps {
  papel: 'DONO' | 'ATENDENTE' | null
}

// A logo e o login ficam na barra do topo (app/layout.tsx), não aqui —
// este componente é só o painel do menu. No desktop usamos
// `collapsible="none"`: o <Sidebar> padrão do shadcn é "position: fixed"
// preso na borda do navegador, o que impediria ele de ser um painel
// separado dentro do quadro central. No mobile vira uma gaveta (Sheet),
// controlada pelo mesmo estado do SidebarTrigger que fica no topo.
export function AppSidebar({ papel }: AppSidebarProps) {
  const pathname = usePathname()
  const { isMobile, openMobile, setOpenMobile } = useSidebar()

  const cabecalho = (
    <div className="shrink-0 border-b border-border/70 bg-gradient-to-r from-primary/85 via-primary to-primary/85 px-4 py-2 text-primary-foreground">
      <p className="text-sm font-semibold tracking-wide">Menu</p>
      <p className="text-[0.65rem] text-primary-foreground/80">Q10 Sorvetes</p>
    </div>
  )

  const navegacao = (
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
  )

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className="w-(--sidebar-width) gap-0 bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Menu de navegação</SheetDescription>
          </SheetHeader>
          {cabecalho}
          {navegacao}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sidebar
      collapsible="none"
      className="hidden w-[252px] shrink-0 overflow-hidden rounded-xl border border-border/70 shadow-lg md:flex"
    >
      {cabecalho}
      {navegacao}
    </Sidebar>
  )
}
