'use client'

import { usePathname } from 'next/navigation'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

// Título mostrado na faixa no topo do painel de conteúdo (o "HOME" do
// modelo de referência). Fica aqui, derivado da rota, em vez de cada página
// ter que passar o próprio título pro layout — que no App Router exigiria
// context ou prop drilling por todas as páginas.
const TITULOS: Record<string, string> = {
  '/': 'Início',
  '/vendas': 'Registrar venda',
  '/dashboard': 'Dashboard',
  '/login': 'Entrar',
  '/perfil': 'Editar perfil',
  '/estabelecimento': 'Estabelecimento',
}

export function TituloPagina() {
  const pathname = usePathname()

  const itemCardapio = ITENS_CARDAPIO.find((item) => `/cardapio/${item.slug}` === pathname)
  const titulo = itemCardapio?.titulo ?? TITULOS[pathname] ?? ''

  return <>{titulo}</>
}
