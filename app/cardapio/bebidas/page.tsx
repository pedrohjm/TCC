import { PaginaCardapioEmBreve } from '@/components/PaginaCardapioEmBreve'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

const item = ITENS_CARDAPIO.find((item) => item.slug === 'bebidas')!

export default function PaginaBebidas() {
  return <PaginaCardapioEmBreve titulo={item.titulo} descricao={item.descricao} icone={item.icone} />
}
