# V8.11.1 — correção de aplicação do tema preto+dourado

## Sintoma observado em produção
O logo preto/dourado e os workflows 52/53 foram atualizados, porém o shell autenticado
continuou usando a paleta clara da V8.10.

## Correção
A V8.11.1 não depende mais somente de redefinir os tokens no final de `styles.css`.

Foi criada uma folha dedicada e versionada:
`src/theme-black-gold-v8111.css`

Ela é carregada por último em `__root.tsx` e aplica:
- tokens escuros no shell autenticado;
- overrides explícitos das utilities reais (`bg-background`, `bg-card`, `bg-surface`,
  `bg-sidebar`, textos, bordas, inputs e estados hover);
- correções explícitas para o módulo de Reuniões;
- CTA dourado/champagne;
- tema escopado em `.apg-theme-black-gold`.

O shell autenticado agora recebe a classe `apg-theme-black-gold`.

## Preservado
- login homologado e sua imagem;
- logo preto/dourado;
- APIs;
- autenticação;
- RBAC admin/inventory;
- perfil estoque;
- propostas;
- reuniões;
- Vite allowedHosts;
- workflows 52/53 já homologados.

## Publicação
Esta correção substitui somente o frontend V8.11.
Os workflows 52 e 53 NÃO precisam ser importados novamente.
