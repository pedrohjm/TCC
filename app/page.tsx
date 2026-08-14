import Link from 'next/link'
import { IceCreamBowl, Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvisosHome } from '@/components/AvisosHome'
import { FaleConosco } from '@/components/FaleConosco'
import { FotoDestaque } from '@/components/FotoDestaque'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

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

      {/* 2 colunas no máximo: o painel de conteúdo agora é estreito
          (~790px), então 3 colunas ficariam apertadas. */}
      <section className="grid gap-4 sm:grid-cols-2">
        {ITENS_CARDAPIO.map((item) => {
          const Icone = item.icone
          return (
            <Link key={item.slug} href={`/cardapio/${item.slug}`} className="block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icone className="h-5 w-5" />
                  </span>
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <CardTitle className="text-base">{item.titulo}</CardTitle>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{item.descricao}</CardContent>
              </Card>
            </Link>
          )
        })}
      </section>

      <FaleConosco />
    </div>
  )
}
