import { PaginaCardapioEmBreve } from '@/components/PaginaCardapioEmBreve'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

const item = ITENS_CARDAPIO.find((item) => item.slug === 'sabores-1800ml')!

export default function PaginaSabores1800ml() {
  return <PaginaCardapioEmBreve titulo={item.titulo} descricao={item.descricao} icone={item.icone} />
}
