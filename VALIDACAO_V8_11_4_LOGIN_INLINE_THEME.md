# V8.11.4 — Login preto/dourado com tema injetado no runtime

## Diagnóstico
A V8.11.3 comprovou que o componente React atualizado estava sendo publicado: os botões
`Manter conectado` e `Esqueci minha senha` desapareceram e o campo de usuário passou a iniciar
vazio. Mesmo assim, a paleta continuou clara.

Isso isola o problema na camada CSS externa do login: o HTML/JS novo chega ao navegador,
mas a regra visual efetiva continua vindo de uma folha clara antiga/cacheada no ambiente de publicação.

## Correção V8.11.4
Nenhuma mudança estrutural foi feita no LoginPage e nenhum novo arquivo CSS externo foi criado.

As regras críticas de cor do login agora são incluídas em `LOGIN_RUNTIME_THEME_CSS` dentro do próprio
`index.tsx` e renderizadas por `<style>{LOGIN_RUNTIME_THEME_CSS}</style>` junto com o componente.

Com isso:
- layout continua usando a estrutura estável `.apg-login-v84*`;
- preto/dourado acompanha o bundle/SSR que já comprovadamente atualiza em produção;
- uma folha CSS externa antiga não consegue manter o painel claro;
- regras usam `!important` para prevalecer inclusive contra CSS legado;
- autofill do Chromium/Edge também recebe fundo escuro.

## Limpeza preservada
- `Manter conectado`: removido;
- `Esqueci minha senha`: removido;
- username predefinido: removido;
- placeholder: `Digite seu usuário`;
- login usa `remember=false`.

## Sem alterações
- APIs e server proxy;
- RBAC admin/inventory;
- workflows 52/53;
- banco de dados;
- Vite allowedHosts;
- restante do tema preto/dourado.
