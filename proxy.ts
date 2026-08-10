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

// "/", "/cardapio/*" e "/estabelecimento" são a visão do cliente — pública,
// sem login, pra poder ser aberta num tablet da loja ou no celular do
// cliente.
const CAMINHOS_PUBLICOS = ['/', '/cardapio', '/estabelecimento']

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

  // Dashboard e relatórios são visão de dono do negócio — o atendente não
  // precisa (nem deve) ver faturamento consolidado da loja.
  if (pathname.startsWith('/dashboard') && req.auth.user.papel !== 'DONO') {
    return Response.redirect(new URL('/', req.nextUrl.origin))
  }
})

export const config = {
  // O `.*\.` no fim exclui qualquer caminho com extensão de arquivo — ou
  // seja, os arquivos estáticos de /public (logo, imagem de fundo,
  // favicon...). Sem isso o proxy tratava /images/logo/Logo.png como uma
  // página protegida e respondia 302 pro /login, então a logo só carregava
  // pra quem já estivesse logado.
  matcher: ['/((?!api|login|_next|.*\\.).*)'],
}
