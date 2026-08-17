import { PaginaCardapioEmBreve } from '@/components/PaginaCardapioEmBreve'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

const item = ITENS_CARDAPIO.find((item) => item.slug === 'acompanhamentos')!

export default function PaginaAcompanhamentos() {
  return <PaginaCardapioEmBreve titulo={item.titulo} descricao={item.descricao} icone={item.icone} />
}
