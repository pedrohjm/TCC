-- CreateEnum
CREATE TYPE "TipoEncomenda" AS ENUM ('POTE', 'CAIXA');
CREATE TYPE "StatusEncomenda" AS ENUM ('PENDENTE', 'FEITO', 'ENTREGUE');

-- CreateTable
CREATE TABLE "Encomenda" (
    "id" SERIAL NOT NULL,
    "nomeCliente" TEXT NOT NULL,
    "saborId" INTEGER NOT NULL,
    "tipo" "TipoEncomenda" NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "dataEntrega" TIMESTAMP(3) NOT NULL,
    "status" "StatusEncomenda" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encomenda_pkey" PRIMARY KEY ("id")
);

-- A lista da tela sempre filtra por status e ordena por data de entrega.
CREATE INDEX "Encomenda_status_dataEntrega_idx" ON "Encomenda"("status", "dataEntrega");

-- AddForeignKey
ALTER TABLE "Encomenda" ADD CONSTRAINT "Encomenda_saborId_fkey" FOREIGN KEY ("saborId") REFERENCES "Sabor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
