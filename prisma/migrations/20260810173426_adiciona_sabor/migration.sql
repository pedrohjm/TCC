-- CreateEnum
CREATE TYPE "CategoriaSabor" AS ENUM ('DOCE', 'FRUTA', 'AZEDO');

-- CreateTable
CREATE TABLE "Sabor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaSabor" NOT NULL,
    "descricao" TEXT NOT NULL,
    "foto" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sabor_pkey" PRIMARY KEY ("id")
);
