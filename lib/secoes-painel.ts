import { LayoutDashboard, PackageX, ShoppingCart, type LucideIcon } from 'lucide-react'
import type { Papel } from '@/app/generated/prisma/client'

export type SecaoPainelId = 'vendas' | 'estoque' | 'dashboard'

export interface SecaoPainel {
  id: SecaoPainelId
  rotulo: string
  descricao: string
  icone: LucideIcon
  /** Só o dono enxerga — faturamento consolidado da loja não é visão de
   *  atendente (a mesma regra que a rota `/api/relatorios` aplica com
   *  `exigirDono`). */
  somenteDono?: boolean
}

// As categorias do painel da equipe (`/painel`). A ordem aqui é a ordem
// dos botões na tela, e a primeira categoria permitida é a que abre por
// padrão.
export const SECOES_PAINEL: SecaoPainel[] = [
  {
    id: 'vendas',
    rotulo: 'Registrar venda',
    descricao: 'Monte a comanda, escolha a forma de pagamento e feche a venda.',
    icone: ShoppingCart,
  },
  {
    id: 'estoque',
    rotulo: 'Falta no estoque',
    descricao: 'Marque o que acabou pra avisar o cliente no cardápio.',
    icone: PackageX,
  },
  {
    id: 'dashboard',
    rotulo: 'Dashboard',
    descricao: 'Faturamento, formas de pagamento e produtos mais vendidos.',
    icone: LayoutDashboard,
    somenteDono: true,
  },
]

export function secoesDoPapel(papel: Papel): SecaoPainel[] {
  return SECOES_PAINEL.filter((secao) => !secao.somenteDono || papel === 'DONO')
}

// Traduz o `?secao=` da URL numa categoria que aquele papel pode abrir.
// Vale tanto pra link compartilhado quanto pro F5. Um valor inválido — ou
// um atendente tentando `?secao=dashboard` na mão — cai na primeira
// categoria permitida em vez de dar erro.
export function secaoInicial(valor: string | undefined, papel: Papel): SecaoPainelId {
  const permitidas = secoesDoPapel(papel)
  return permitidas.find((secao) => secao.id === valor)?.id ?? permitidas[0].id
}
