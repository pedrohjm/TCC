import { IceCreamBowl, IceCream2, Popsicle, CakeSlice, CupSoda, type LucideIcon } from 'lucide-react'

export interface ItemCardapio {
  slug: string
  titulo: string
  descricao: string
  icone: LucideIcon
}

// Cada item aqui vira, ao mesmo tempo, uma entrada no menu lateral e um card
// na home pública — a lista de sabores/produtos de cada categoria ainda não
// existe (fica pra quando essas telas forem implementadas), por enquanto é
// só a navegação + uma página "em breve".
export const ITENS_CARDAPIO: ItemCardapio[] = [
  {
    slug: 'sabores-1800ml',
    titulo: 'Sabores 1800 ml',
    descricao: 'Sabores disponíveis em pote de 1800 ml no estoque da loja.',
    icone: IceCreamBowl,
  },
  {
    slug: 'selfservice',
    titulo: 'SelfService',
    descricao: 'Sabores disponíveis agora no self-service.',
    icone: IceCream2,
  },
  {
    slug: 'picoles',
    titulo: 'Picolés',
    descricao: 'Picolés disponíveis na loja.',
    icone: Popsicle,
  },
  {
    slug: 'acompanhamentos',
    titulo: 'Acompanhamentos',
    descricao: 'Coberturas, granulados e outros acompanhamentos.',
    icone: CakeSlice,
  },
  {
    slug: 'bebidas',
    titulo: 'Bebidas',
    descricao: 'Bebidas disponíveis na loja.',
    icone: CupSoda,
  },
]
