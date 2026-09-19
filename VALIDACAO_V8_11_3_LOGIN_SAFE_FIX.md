# V8.11.3 — Login safe fix

## Diagnóstico
A V8.11.2 introduziu um novo asset `login-v8112.css` e um novo namespace de classes. Em produção, o resultado foi uma página totalmente preta, indicando que o shell global carregou, mas a árvore visual do login não chegou a ficar utilizável.

## Estratégia da correção
A V8.11.3 parte da V8.11.1, última versão cujo frontend autenticado estava comprovadamente funcionando em produção.

- `__root.tsx` permanece exatamente igual ao da V8.11.1.
- O login volta a usar o namespace já conhecido `.apg-login-v84*`.
- `login-v84.css` continua sendo carregado como antes.
- As cores preto/dourado são reforçadas em `theme-black-gold-v8111.css`, que é carregado depois do CSS do login e já foi comprovado em produção.
- Não existe novo import CSS, novo link de stylesheet ou novo namespace de runtime.

## Limpeza funcional
- removido `Manter conectado`;
- removido `Esqueci minha senha`;
- removido o estado `remember`;
- login envia `remember=false`;
- campo usuário inicia vazio;
- removido placeholder `priscila.gefune`;
- novo placeholder `Digite seu usuário`;
- `autocomplete=off` aplicado ao formulário/campo de usuário.

## Preservado
Imagem homologada, mostrar/ocultar senha, autenticação username, RBAC, perfil estoque, APIs, tema interno, preview/PDF e allowedHosts.
