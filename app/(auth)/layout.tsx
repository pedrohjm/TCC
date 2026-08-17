// Entrar e criar conta são as únicas telas que ocupam a janela do
// navegador inteira: não têm a barra do topo nem o menu lateral, porque
// quem está aqui ainda não entrou no sistema. Por isso ficam no seu
// próprio grupo de rota, fora de (janela) e de (landing).
//
// A moldura em si (foto à esquerda, formulário à direita) está em
// components/MolduraAuth.tsx, usada pelas duas páginas.
export default function LayoutAuth({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="relative z-10 bg-background">{children}</div>
}
