# Imagens do site

Pasta pra colocar as imagens usadas no cardápio/site. Tudo aqui vira uma URL
pública em `/images/...` (ex.: `public/images/logo/logo.png` fica acessível
em `/images/logo/logo.png`).

- `logo/logo.png` — logo da sorveteria, usada no topo do menu lateral
  (`components/AppSidebar.tsx`). Enquanto o arquivo não existir, aparece um
  ícone de loja no lugar (fallback automático, não quebra nada).
- `cardapio/` — fotos dos sabores/produtos, pra usar quando as telas de
  Sabores 1800ml, SelfService, Picolés, Acompanhamentos e Bebidas forem
  implementadas de verdade.
- `banners/` — imagens maiores (ex. banner da home), se um dia a home
  precisar de uma foto em vez do fundo colorido atual.

Formatos recomendados: `.png` (com fundo transparente) ou `.jpg`/`.webp`
pra fotos. Não precisa avisar o Claude Code depois de adicionar os
arquivos — o `<img>`/`<Avatar>` já aponta pro caminho certo.
