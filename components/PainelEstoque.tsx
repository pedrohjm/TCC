import { PackageX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Só reserva o lugar da categoria por enquanto — o usuário pediu a tela
// sabendo que ela "irá ser adicionada posteriormente".
//
// O que ela vai fazer, pra quando for implementada:
// 1. listar os produtos/sabores e deixar marcar quais estão em falta;
// 2. a marcação vira uma faixa vermelha em cima do item no cardápio do
//    cliente (ex.: sabor de 1800 ml esgotado aparece avisando a falta).
//
// Do lado dos dados isso quer dizer um campo novo (algo como
// `emFalta Boolean @default(false)`) no model `Sabor` — e depois nos
// outros produtos, quando as outras categorias saírem do "em breve" —,
// uma rota pra ligar/desligar a marcação e o aviso na `GradeSabores`.
export function PainelEstoque() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PackageX className="h-5 w-5" />
          </span>
          <div className="flex flex-1 items-center justify-between gap-2">
            <CardTitle className="text-lg">Falta no estoque</CardTitle>
            <Badge variant="secondary">Em breve</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Aqui vai dar pra marcar os produtos que acabaram. O que for marcado ganha uma faixa
            vermelha no cardápio do cliente, avisando que está em falta.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
