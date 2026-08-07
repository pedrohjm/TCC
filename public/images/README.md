# Imagens do site

Pasta pra colocar as imagens usadas no cardápio/site. Tudo aqui vira uma URL
pública em `/images/...` (ex.: `public/images/logo/logo.png` fica acessível
em `/images/logo/logo.png`).

- `logo/Logo.png` — logo da Q10 Sorvetes, usada no topo da janela
  (`app/layout.tsx`). Enquanto o arquivo não existir (ou tiver outro nome),
  aparece um ícone de loja no lugar (fallback automático, não quebra nada).
  Atenção ao nome exato do arquivo (`Logo.png`, com L maiúsculo) — no
  Windows não faz diferença, mas em produção (Linux) faz.
- `banners/fundo.jpg` — imagem de fundo atrás da "janela" do app
  (`components/FundoPagina.tsx`). Sem esse arquivo, cai num gradiente.
- `cardapio/` — fotos dos sabores/produtos, pra usar quando as telas de
  Sabores 1800ml, SelfService, Picolés, Acompanhamentos e Bebidas forem
  implementadas de verdade.
- `banners/` — imagens maiores (ex. banner da home), se um dia a home
  precisar de uma foto em vez do fundo colorido atual.

Formatos recomendados: `.png` (com fundo transparente) ou `.jpg`/`.webp`
pra fotos. Não precisa avisar o Claude Code depois de adicionar os
arquivos — o `<img>`/`<Avatar>` já aponta pro caminho certo.
