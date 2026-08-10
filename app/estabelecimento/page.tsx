import { Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Só reserva o lugar no menu por enquanto — foto e descrição do
// estabelecimento entram depois (pedido do usuário: "faça somente o lugar
// dela no menu semelhante aos outros").
export default function PaginaEstabelecimento() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center p-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </span>
          <div className="flex flex-1 items-center justify-between gap-2">
            <CardTitle className="text-lg">Estabelecimento</CardTitle>
            <Badge variant="secondary">Em breve</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Foto e descrição do local ainda vão ser adicionadas aqui.</p>
        </CardContent>
      </Card>
    </div>
  )
}
