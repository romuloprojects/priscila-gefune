# V8.12.1 — correção CSS / LightningCSS

## Erro observado
`[plugin:vite:css] [lightningcss] Unexpected token Delim('/')`

O Vite indicava `/app/src/styles.css:4159:21` depois da expansão do CSS/Tailwind.
No arquivo-fonte do projeto, a origem era a regra na linha 413:

```css
.hover\\:bg-primary\\/90:hover {
```

O seletor estava com escape duplicado. O `\\` representa uma barra invertida literal,
deixando `/90` exposto ao parser do LightningCSS, que interrompia a compilação.

## Correção
O seletor correto ficou:

```css
.hover\:bg-primary\/90:hover {
```

Isso representa corretamente a classe Tailwind `hover:bg-primary/90` em CSS puro.

## Escopo
Nenhuma regra funcional, API, RBAC, login, clientes, estoque, foto ou workflow n8n foi alterado.
A V8.12.1 difere da V8.12 somente por esta correção em `src/styles.css` e por este documento de validação.
