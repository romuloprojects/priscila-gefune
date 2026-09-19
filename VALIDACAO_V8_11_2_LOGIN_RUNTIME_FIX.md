# V8.11.2 — correção definitiva da página de login

## Diagnóstico
O login é retornado antes do shell autenticado `.apg-theme-black-gold`. Portanto, a folha global V8.11.1 não alcança a página de login. A página dependia exclusivamente do antigo caminho `login-v84.css` e do namespace `.apg-login-v84*`.

Mesmo após alterar o conteúdo desse CSS, o caminho/namespace continuavam os mesmos usados pelas versões claras anteriores, permitindo cache/colisão no runtime publicado.

## Correção
- novo arquivo: `src/login-v8112.css`;
- novo namespace: `.apg-login-v8112*`;
- import do novo CSS por último em `__root.tsx`;
- o antigo `login-v84.css` fica legado e não é mais importado.

## Limpeza solicitada
Removidos do React e do DOM:
- `Manter conectado`;
- `Esqueci minha senha`;
- estado `remember`.

O login agora envia `remember: false`.

O campo Usuário inicia vazio, usa placeholder `Digite seu usuário` e `autocomplete="off"`. A aplicação não mostra mais `priscila.gefune` antes da digitação.

## Preservado
Imagem homologada do login, mostrar/ocultar senha, autenticação por username, RBAC, perfil estoque, APIs, tema preto+dourado do sistema e workflows 52/53.
