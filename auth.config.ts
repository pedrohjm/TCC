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
    // banco aqui. Fica neste arquivo (e não só em auth.ts) porque proxy.ts
    // instancia o NextAuth com este config: assim os dois enxergam a
    // sessão com o mesmo formato, com `papel` incluído. Hoje o proxy só
    // pergunta se existe sessão, mas já precisou do papel — e a página que
    // decide o que o atendente vê continua precisando.
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.papel = token.papel as 'DONO' | 'ATENDENTE'
      return session
    },
  },
} satisfies NextAuthConfig
