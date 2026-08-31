import { IceCreamBowl, IceCream2, Popsicle, CakeSlice, CupSoda, type LucideIcon } from 'lucide-react'

export interface ItemCardapio {
  slug: string
  titulo: string
  descricao: string
  icone: LucideIcon
}

// As categorias do cardápio do cliente. Viram os botões da seção
// "Cardápio" da home (components/CardapioLanding.tsx), que é onde os
// produtos aparecem. Só "Sabores 1800 ml" tem dados de verdade no banco;
// as outras quatro ainda mostram um card "em breve".
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
