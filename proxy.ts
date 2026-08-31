import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Protege toda página do app (não as rotas de /api, que já se protegem
// sozinhas em cada handler). Sem sessão, redireciona pro /login.
//
// Next.js 16 renomeou "middleware" pra "proxy" (proxy.ts roda no runtime
// Node.js por padrão agora, não mais no Edge). Usamos aqui só a parte
// leve do config de auth (auth.config.ts, sem Prisma/bcrypt) porque este
// arquivo roda antes de qualquer página — não precisa do provider de
// login completo, só de saber se já existe uma sessão.
const { auth } = NextAuth(authConfig)

// "/" é a visão do cliente — pública, sem login, pra poder ser aberta num
// tablet da loja ou no celular do cliente. Cardápio e localização ficam
// nela, em seções da própria página; as páginas separadas que existiam
// pra isso (/cardapio/<slug>, /estabelecimento) foram removidas.
const CAMINHOS_PUBLICOS = ['/']

function ehCaminhoPublico(pathname: string) {
  return CAMINHOS_PUBLICOS.some(
    (caminho) => pathname === caminho || pathname.startsWith(`${caminho}/`)
  )
}

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (ehCaminhoPublico(pathname)) {
    return
  }

  if (!req.auth) {
    return Response.redirect(new URL('/login', req.nextUrl.origin))
  }

  // Faturamento consolidado é visão de dono do negócio, não de atendente.
  // Isso não dá mais pra checar por caminho: o dashboard virou uma
  // categoria dentro de /painel, e não uma rota própria. A trava mudou de
  // lugar, em dois pontos:
  //   - app/(sistema)/painel/page.tsx só entrega a categoria do dashboard
  //     pra quem é DONO (lib/secoes-painel.ts decide);
  //   - GET /api/relatorios chama `exigirDono()`, que é quem de fato
  //     protege os números — a tela sumir é conveniência, não segurança.
})

export const config = {
  // `login` e `registrar` ficam de fora porque são as telas de quem ainda
  // não entrou — se o proxy as protegesse, elas redirecionariam pra si
  // mesmas em loop.
  //
  // O `.*\.` no fim exclui qualquer caminho com extensão de arquivo — ou
  // seja, os arquivos estáticos de /public (logo, imagem de fundo,
  // favicon...). Sem isso o proxy tratava /images/logo/Logo.png como uma
  // página protegida e respondia 302 pro /login, então a logo só carregava
  // pra quem já estivesse logado.
  matcher: ['/((?!api|login|registrar|_next|.*\\.).*)'],
}
