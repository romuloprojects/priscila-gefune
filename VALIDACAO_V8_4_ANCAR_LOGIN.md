# V8.4 — Login no padrão ANCAR

## Causa encontrada
A V8.3 colocou as regras críticas do login no fim de `styles.css`. No deploy mostrado, o HTML/JS novo chegou ao navegador, mas o CSS correspondente ao login não foi aplicado, deixando os elementos em fluxo HTML puro. Isso é compatível com asset CSS antigo/cacheado ou bundle principal de CSS não atualizado enquanto o JS/asset de imagem já havia mudado.

## Correção aplicada
- Replicado o padrão que estabilizou o login ANCAR V5.6.1: folha **exclusiva e versionada** carregada depois do CSS principal.
- `src/login-v84.css` controla todo o layout crítico do login sem depender de utilities Tailwind.
- `src/meetings-v84.css` faz o mesmo para o modal e configuração de Reuniões.
- `__root.tsx` carrega: `styles.css` -> `login-v84.css` -> `meetings-v84.css`.
- Login desktop fica limitado à viewport; quando a altura é curta, só o painel do formulário ganha scroll.
- Tablet portrait/mobile usa uma coluna, como no padrão ANCAR.
