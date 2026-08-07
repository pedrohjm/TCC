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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

interface AppSidebarProps {
  papel: 'DONO' | 'ATENDENTE' | null
}

// A logo/marca fica no topo da "janela" (app/layout.tsx), não aqui — este
// componente é só o menu. Por isso não usamos o <Sidebar> padrão do shadcn
// no desktop: ele é "position: fixed" preso na borda real do navegador, o
// que quebraria a ideia de janela flutuante centralizada. Com
// `collapsible="none"` ele vira uma div comum que ocupa a altura do pai —
// exatamente o que cabe dentro da janela. No mobile, trocamos por um Sheet
// (gaveta), controlado pelo mesmo estado do SidebarTrigger no header.
export function AppSidebar({ papel }: AppSidebarProps) {
  const pathname = usePathname()
  const { isMobile, openMobile, setOpenMobile } = useSidebar()

  const conteudo = (
    <>
      <SidebarHeader className="px-3 py-3">
        <span className="text-sm font-semibold text-sidebar-foreground">Menu</span>
        <span className="text-xs text-sidebar-foreground/60">Q10 Sorvetes</span>
      </SidebarHeader>

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
                  <SidebarMenuButton render={<Link href="/dashboard" />} isActive={pathname === '/dashboard'}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </>
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
          {conteudo}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sidebar collapsible="none" className="hidden border-r md:flex">
      {conteudo}
    </Sidebar>
  )
}
