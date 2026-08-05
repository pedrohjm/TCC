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

export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL('/login', req.nextUrl.origin))
  }
})

export const config = {
  matcher: ['/((?!api|login|_next).*)'],
}
