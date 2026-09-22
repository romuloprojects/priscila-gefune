# VALIDAÇÃO V8.12.5 — Foto da Home sem corte

## Problema identificado
Na V8.12.4 o hero da Home mantinha a imagem como uma camada absoluta ocupando 100% do card e usando `object-cover`. Esse modo sempre prioriza preencher toda a área e, quando a proporção do card diverge da proporção da fotografia, amplia e recorta a imagem. Foi isso que deixou a Priscila excessivamente aproximada e com o rosto cortado.

## Ajuste aplicado
- Mantido exatamente o mesmo card/hero da Home e sua altura/layout.
- A foto passou a usar o arquivo original completo (`priscila-home-photo.jpg`).
- Alterado somente o modo de encaixe da imagem para `object-contain object-right`.
- O fundo escuro do próprio card e o `bg-hero-wash` existente continuam preenchendo a área à esquerda, portanto não há necessidade de ampliar/cortar a fotografia para preencher o card.
- A foto permanece ancorada à direita e visualmente mais distante, exibindo o enquadramento completo.

## Escopo preservado
- Alertas de eventos com reservas ativas da V8.12.4 permanecem intactos.
- Regras de eventos/reservas permanecem intactas.
- `src/services/atelierApi.ts`, `src/server.ts`, `vite.config.ts` e contratos da API não foram alterados.
