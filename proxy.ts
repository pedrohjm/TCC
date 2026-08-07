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

// "/" e "/cardapio/*" são a visão do cliente (cardápio) — pública, sem
// login, pra poder ser aberta num tablet da loja ou no celular do cliente.
const CAMINHOS_PUBLICOS = ['/', '/cardapio']

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
  matcher: ['/((?!api|login|_next).*)'],
}
