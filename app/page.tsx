import { IceCreamBowl, Store } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AvisosHome } from '@/components/AvisosHome'
import { FaleConosco } from '@/components/FaleConosco'
import { FotoDestaque } from '@/components/FotoDestaque'
import { SobreNos } from '@/components/SobreNos'

// Home pública — visão do cliente. Não exige login: qualquer visitante
// (num tablet da loja ou no celular) enxerga o cardápio. As telas de
// atendente (registro de venda) e dono (dashboard) ficam atrás de login,
// veja proxy.ts.
export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6">
      {/* Topo: foto grande no mesmo estilo da página Estabelecimento
          (components/FotoDestaque.tsx), com as boas-vindas logo abaixo.
          Mais baixa que a de lá (16:7 em vez de 16:10) só porque a home tem
          bastante coisa embaixo — na proporção original a foto sozinha
          ocupava a tela inteira e empurrava os avisos pra fora. */}
      <Card className="gap-0 overflow-hidden py-0">
        <FotoDestaque
          src="/images/banners/home.jpg"
          alt="Q10 Sorvetes"
          iconeFallback={<Store />}
          iconeBadge={<IceCreamBowl />}
          className="aspect-16/9 sm:aspect-16/7"
        />
        <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
          <h1 className="font-heading text-2xl font-bold text-balance sm:text-3xl">
            Bem-vindo(a) à Q10 Sorvetes
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Confira nosso cardápio: sabores de 1800 ml, self-service, picolés, acompanhamentos e
            bebidas.
          </p>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-1 font-heading text-lg font-semibold">Avisos</h2>
        <AvisosHome />
      </section>

      {/* Os atalhos pras 5 categorias do cardápio saíram daqui (pedido do
          usuário) — a navegação pra elas continua no menu lateral (desktop)
          e no submenu do botão "Cardápio" da barra de baixo (mobile). */}
      <SobreNos />

      <FaleConosco />
    </div>
  )
}
