# V8.12.7 — Exclusão segura de item do estoque

## Problema corrigido
A tela de Estoque permitia criar e editar itens, mas não oferecia uma forma de remover um item cadastrado por engano.

## Implementação
- Ao editar um item do Estoque como **admin**, o modal agora exibe o botão **Excluir item**.
- A exclusão usa o endpoint já existente de atualização de estoque (`/inventory-update`) enviando `active: false`.
- Isso funciona como exclusão lógica (soft delete): o item sai do catálogo ativo sem apagar referências históricas que possam existir em eventos ou propostas.
- Após a exclusão, os dados são atualizados e o item deixa de aparecer no Estoque.
- O carregamento do frontend também ignora itens com `active === false`, garantindo que um item arquivado não volte a aparecer mesmo que a API retorne registros inativos.
- O perfil `inventory` continua sem acesso à ação destrutiva; a exclusão fica restrita ao perfil `admin`.

## Preservado
- API base `/api/atelier`;
- `src/server.ts`;
- autenticação e RBAC existentes;
- reservas e disponibilidade;
- histórico de eventos e propostas;
- banner homologado da Home;
- alertas de reservas.

## Observação operacional
A exclusão é lógica, não física. Essa escolha é intencional para preservar integridade e histórico do acervo.
