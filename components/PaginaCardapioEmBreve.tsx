import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PaginaCardapioEmBreveProps {
  titulo: string
  descricao: string
  icone: LucideIcon
}

// As páginas de cardápio (Sabores 1800ml, SelfService, Picolés,
// Acompanhamentos, Bebidas) ainda não têm uma lista real de produtos — o
// modelo Produto no banco não distingue essas categorias hoje. Por
// enquanto cada rota só reserva o lugar no menu; a lista real (puxando do
// banco via Prisma) é uma tela futura.
export function PaginaCardapioEmBreve({ titulo, descricao, icone: Icone }: PaginaCardapioEmBreveProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center p-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icone className="h-5 w-5" />
          </span>
          <div className="flex flex-1 items-center justify-between gap-2">
            <CardTitle className="text-lg">{titulo}</CardTitle>
            <Badge variant="secondary">Em breve</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{descricao}</p>
          <p>Esta lista ainda vai ser implementada — por enquanto é só a navegação.</p>
        </CardContent>
      </Card>
    </div>
  )
}
