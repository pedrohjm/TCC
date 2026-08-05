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
  },
} satisfies NextAuthConfig
