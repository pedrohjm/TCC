-- Reserva sai: era nome + data + status, sem produto, nunca teve tela, e a
-- Encomenda cobre o mesmo caso com o que foi pedido junto.
-- Venda.reservaId vira Venda.encomendaId.

-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_reservaId_fkey";

-- AlterTable: troca o vinculo. Venda que apontava pra uma reserva passa a
-- nao apontar pra nada -- a reserva em si deixa de existir, e nao ha
-- encomenda correspondente pra onde apontar. O valor e os itens da venda
-- nao mudam; so se perde "esta venda veio de uma reserva", que era a
-- informacao que o model Reserva carregava.
ALTER TABLE "Venda" DROP COLUMN "reservaId";
ALTER TABLE "Venda" ADD COLUMN "encomendaId" INTEGER;

-- DropTable
DROP TABLE "Reserva";

-- DropEnum
DROP TYPE "StatusReserva";

-- Produto: qual tipo de encomenda cada produto atende
ALTER TABLE "Produto" ADD COLUMN "tipoEncomenda" "TipoEncomenda";

-- CreateIndex: um pra um nos dois casos
CREATE UNIQUE INDEX "Venda_encomendaId_key" ON "Venda"("encomendaId");
CREATE UNIQUE INDEX "Produto_tipoEncomenda_key" ON "Produto"("tipoEncomenda");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_encomendaId_fkey" FOREIGN KEY ("encomendaId") REFERENCES "Encomenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Liga os produtos que ja existem aos tipos de encomenda.
UPDATE "Produto" SET "tipoEncomenda" = 'POTE'  WHERE "nome" = 'Pote 1800 mL';
UPDATE "Produto" SET "tipoEncomenda" = 'CAIXA' WHERE "nome" = 'Caixa';
