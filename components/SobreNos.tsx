'use client'

import { AboutUsSection } from '@/components/ui/about-us-section'
import { ITENS_SOBRE_NOS, NUMEROS_SOBRE_NOS, TEXTO_SOBRE_NOS } from '@/lib/sobre-nos'

// Client component que importa os dados ele mesmo, em vez de recebê-los por
// prop da home (server component): cada item carrega um ícone, que é uma
// função, e função não atravessa a fronteira servidor→client. Mesmo padrão
// do AvisosHome e do MenuMobile.
export function SobreNos() {
  return (
    <AboutUsSection
      rotuloTopo="Conheça a Q10"
      titulo="Sobre nós"
      texto={TEXTO_SOBRE_NOS}
      itens={ITENS_SOBRE_NOS}
      numeros={NUMEROS_SOBRE_NOS}
      imagemSrc="/images/banners/sobre.jpg"
      imagemAlt="Equipe da Q10 Sorvetes"
    />
  )
}
