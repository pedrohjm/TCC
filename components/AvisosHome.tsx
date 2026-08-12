'use client'

import { StandardCardCarousel } from '@/components/ui/standard-card'
import { AVISOS } from '@/lib/avisos'

// Precisa ser client component e importar AVISOS aqui dentro (em vez de
// receber a lista por prop da home, que é server component): cada aviso
// carrega um ícone, que é uma *função*, e função não atravessa a fronteira
// servidor→client. Mesmo motivo pelo qual o MenuMobile importa
// ITENS_CARDAPIO direto.
export function AvisosHome() {
  return <StandardCardCarousel itens={AVISOS} />
}
