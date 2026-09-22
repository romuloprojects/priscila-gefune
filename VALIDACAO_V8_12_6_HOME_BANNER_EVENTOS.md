# VALIDAÇÃO V8.12.6 — Banner Home homologado

## Escopo
Alteração pontual sobre a V8.12.5, preservando todo o restante da frontend e as melhorias de reservas/alertas já implementadas.

## Home
- A imagem aprovada pelo usuário foi convertida em um asset panorâmico próprio para o hero da dashboard.
- A composição preserva a Priscila no lado direito e mantém área escura à esquerda para o texto da Home.
- O asset final foi preparado em 2560 × 360 px para preencher o banner sem o efeito de foto pequena/solta da V8.12.5.
- O hero voltou a usar `object-cover`, agora com um asset de proporção adequada ao card.

## Reservas e alertas
- Mantidas integralmente as melhorias da V8.12.4/V8.12.5 para exibir reservas de acervo e alertas de eventos com itens reservados.

## Proteções
- `src/services/atelierApi.ts`: não alterado.
- `src/server.ts`: não alterado.
- `vite.config.ts`: não alterado.
- `package.json`: não alterado.
- Nenhum endpoint, payload, regra de autenticação ou RBAC foi modificado.
