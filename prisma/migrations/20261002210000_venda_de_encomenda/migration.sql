-- "Esta venda veio de uma encomenda" vira um dado proprio da venda, em vez
-- de ser deduzido do vinculo. O vinculo some quando a encomenda e apagada
-- na limpeza da lista de entregues (ON DELETE SET NULL), e sem esta coluna
-- o indicador do dashboard cairia junto, mudando faturamento ja fechado.
ALTER TABLE "Venda" ADD COLUMN "deEncomenda" BOOLEAN NOT NULL DEFAULT false;

-- O que ja esta ligado a uma encomenda veio de uma encomenda.
UPDATE "Venda" SET "deEncomenda" = true WHERE "encomendaId" IS NOT NULL;
