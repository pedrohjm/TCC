import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ITENS_CARDAPIO } from '@/lib/nav-cardapio'

// Home pública — visão do cliente. Não exige login: qualquer visitante
// (num tablet da loja ou no celular) enxerga o cardápio. As telas de
// atendente (registro de venda) e dono (dashboard) ficam atrás de login,
// veja proxy.ts.
export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <section className="overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
        <h1 className="text-3xl font-bold">Bem-vindo(a) à Q10 Sorvetes</h1>
        <p className="mt-2 max-w-xl text-primary-foreground/90">
          Confira nosso cardápio: sabores de 1800 ml, self-service, picolés, acompanhamentos e
          bebidas.
        </p>
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
    </div>
  )
}
