import { Clock, CreditCard, IceCream2, Sparkles, type LucideIcon } from 'lucide-react'

export interface Aviso {
  titulo: string
  descricao: string
  icone: LucideIcon
  /** Etiqueta curta no topo do card (ex.: "Novidade"). */
  rotulo?: string
  /** Se existir, o card vira link e ganha o "Ver mais". */
  href?: string
}

// Avisos que aparecem no carrossel da home. Conteúdo ainda genérico —
// troque o texto aqui quando os avisos reais da loja forem definidos,
// mesma ideia do endereço em lib/estabelecimento.ts. Se um dia a loja
// precisar editar isso sem mexer no código, vira um model no Prisma
// (como foi feito com Sabor) e uma tela de gestão pro DONO.
export const AVISOS: Aviso[] = [
  {
    titulo: 'Novos sabores no pote de 1800 ml',
    descricao:
      'Confira os sabores que estão disponíveis agora no estoque da loja, separados por doce, fruta e azedo.',
    icone: Sparkles,
    rotulo: 'Novidade',
    href: '/cardapio/sabores-1800ml',
  },
  {
    titulo: 'Self-service todos os dias',
    descricao:
      'Monte seu pote do jeito que quiser e pague por peso. Os sabores do dia ficam na tela de SelfService.',
    icone: IceCream2,
    rotulo: 'Todo dia',
    href: '/cardapio/selfservice',
  },
  {
    titulo: 'Horário de funcionamento',
    descricao:
      'Aberto de segunda a domingo. O horário exato ainda vai ser confirmado e atualizado aqui.',
    icone: Clock,
    rotulo: 'Funcionamento',
  },
  {
    titulo: 'Formas de pagamento',
    descricao: 'Aceitamos dinheiro, Pix e cartão de débito e crédito.',
    icone: CreditCard,
    rotulo: 'Pagamento',
  },
]
