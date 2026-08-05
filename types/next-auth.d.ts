import type { Papel } from '@/app/generated/prisma/client'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    papel: Papel
  }

  interface Session {
    user: {
      id: string
      papel: Papel
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    papel: Papel
  }
}
