import {
  Award,
  CalendarDays,
  HandHeart,
  Heart,
  IceCream2,
  IceCreamBowl,
  Smile,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface ItemSobreNos {
  titulo: string
  descricao: string
  icone: LucideIcon
  /** Ícone pequeno sobreposto no canto do ícone principal (enfeite). */
  iconeSecundario: LucideIcon
}

export interface NumeroSobreNos {
  valor: number
  sufixo: string
  rotulo: string
  icone: LucideIcon
}

// Texto de apresentação da loja. Ainda genérico — troque quando o texto
// real for definido, mesma ideia de lib/avisos.ts e lib/estabelecimento.ts.
export const TEXTO_SOBRE_NOS =
  'Somos uma sorveteria de bairro feita pra quem gosta de sorvete de verdade. ' +
  'Trabalhamos com sabores preparados com ingredientes selecionados e um ' +
  'atendimento próximo, pra cada visita valer a pena.'

export const ITENS_SOBRE_NOS: ItemSobreNos[] = [
  {
    titulo: 'Sabores artesanais',
    descricao:
      'Sabores preparados com ingredientes selecionados, do clássico chocolate belga às frutas da estação.',
    icone: IceCreamBowl,
    iconeSecundario: Sparkles,
  },
  {
    titulo: 'Self-service',
    descricao:
      'Monte seu pote do jeito que quiser, com a quantidade que quiser, e pague por peso.',
    icone: IceCream2,
    iconeSecundario: Star,
  },
  {
    titulo: 'Feito com carinho',
    descricao:
      'Cada pote é preparado com cuidado e atenção, do preparo da massa até a hora de servir.',
    icone: Heart,
    iconeSecundario: Sparkles,
  },
  {
    titulo: 'Atendimento próximo',
    descricao:
      'Um atendimento que conhece o cliente pelo nome e ajuda a escolher o sabor certo.',
    icone: HandHeart,
    iconeSecundario: Smile,
  },
]

// ATENÇÃO: números ainda são de exemplo (placeholder), não são dados reais
// da loja. Troque pelos números de verdade antes de mostrar o site pra
// alguém de fora — número inventado em site de loja é informação errada
// pro cliente, não é só enfeite.
export const NUMEROS_SOBRE_NOS: NumeroSobreNos[] = [
  { valor: 30, sufixo: '+', rotulo: 'Sabores no cardápio', icone: IceCreamBowl },
  { valor: 10, sufixo: '', rotulo: 'Anos de história', icone: CalendarDays },
  { valor: 5000, sufixo: '+', rotulo: 'Clientes atendidos', icone: Users },
  { valor: 98, sufixo: '%', rotulo: 'Voltariam a comprar', icone: Award },
]
