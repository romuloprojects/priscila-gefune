# V8.12.8 — correção do modal de edição/exclusão do estoque

## Problema corrigido
Na V8.12.7, o estado React `deleting`/`setDeleting` foi criado por engano dentro de `ProposalCreateModal`, enquanto o botão e a função de exclusão estavam dentro de `EntityModal`.

Ao abrir **Editar item**, o React tentava renderizar referências a `deleting` fora do escopo e a página caía no error boundary.

## Correção
- removido `deleting` de `ProposalCreateModal`;
- criado `deleting` dentro de `EntityModal`, no mesmo escopo de `deleteInventoryItem()` e do botão **Excluir item**;
- nenhuma mudança no fluxo de API ou no endpoint `/inventory-update`;
- exclusão lógica continua usando `active: false`;
- filtro de itens inativos da V8.12.7 foi preservado.

## Validações
- TypeScript confirmou que não existem mais erros `TS2304` para `deleting`/`setDeleting`;
- conferida a presença de um único estado de exclusão em `EntityModal`;
- ZIP testado com `unzip -t`;
- `src/server.ts`, `vite.config.ts`, `package.json` e demais contratos não foram alterados nesta correção.
