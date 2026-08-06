import type { NextAuthConfig } from 'next-auth'

// Parte do config que roda no Edge Runtime (middleware.ts): não pode
// importar nada que dependa de Node.js (Prisma, bcrypt). Só decide se a
// sessão do JWT existe — não faz nenhuma consulta ao banco.
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
    // Só lê campos que já estão no JWT (id, papel) — nenhuma consulta ao
    // banco aqui. Precisa estar neste arquivo (não só em auth.ts) porque
    // proxy.ts instancia o NextAuth só com este config: sem isto, o
    // `req.auth.user.papel` chegaria sempre undefined no proxy e o
    // gate de "só DONO acessa /dashboard" bloquearia todo mundo.
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.papel = token.papel as 'DONO' | 'ATENDENTE'
      return session
    },
  },
} satisfies NextAuthConfig
