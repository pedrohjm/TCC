export interface SecaoLanding {
  id: string
  rotulo: string
}

// Seções da landing (app/(landing)/page.tsx). A ordem aqui é a ordem do
// menu do topo e também a ordem em que aparecem na página — o
// componente NavSecoes usa esses ids tanto pro link âncora quanto pra
// saber qual item destacar conforme a pessoa rola.
export const SECOES_LANDING: SecaoLanding[] = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'cardapio', rotulo: 'Cardápio' },
  { id: 'avisos', rotulo: 'Avisos' },
  { id: 'sobre', rotulo: 'Sobre' },
  { id: 'contato', rotulo: 'Contato' },
]
