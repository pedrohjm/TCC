'use client'

import { usePathname } from 'next/navigation'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

// Título mostrado na faixa no topo do painel de conteúdo (o "HOME" do
// modelo de referência). Fica aqui, derivado da rota, em vez de cada página
// ter que passar o próprio título pro layout — que no App Router exigiria
// context ou prop drilling por todas as páginas.
// Só as rotas do grupo (janela) entram aqui. A home é a landing e as telas
// de entrar/criar conta ocupam a janela inteira — nenhuma das três passa
// por esta faixa.
const TITULOS: Record<string, string> = {
  '/vendas': 'Registrar venda',
  '/estoque': 'Falta no estoque',
  '/dashboard': 'Dashboard',
  '/perfil': 'Editar perfil',
  '/estabelecimento': 'Estabelecimento',
}

export function TituloPagina() {
  const pathname = usePathname()

  const itemCardapio = ITENS_CARDAPIO.find((item) => `/cardapio/${item.slug}` === pathname)
  const titulo = itemCardapio?.titulo ?? TITULOS[pathname] ?? ''

  return <>{titulo}</>
}
