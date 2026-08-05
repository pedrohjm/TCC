import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: {},
        senha: {},
      },
      async authorize(credenciais) {
        const email = typeof credenciais?.email === 'string' ? credenciais.email : undefined
        const senha = typeof credenciais?.senha === 'string' ? credenciais.senha : undefined
        if (!email || !senha) return null

        const usuario = await prisma.usuario.findUnique({ where: { email } })
        if (!usuario) return null

        const senhaValida = await bcrypt.compare(senha, usuario.senhaHash)
        if (!senhaValida) return null

        return {
          id: String(usuario.id),
          name: usuario.nome,
          email: usuario.email,
          papel: usuario.papel,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.papel = user.papel
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.papel = token.papel as 'DONO' | 'ATENDENTE'
      return session
    },
  },
})
