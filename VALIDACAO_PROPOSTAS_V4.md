# Frontend V4 — Propostas flexíveis

## Mudanças
- Nova proposta pode ser criada para **novo contato** ou **cliente cadastrado**.
- Evento vinculado é opcional.
- Valor do pacote é editável na criação.
- Itens/locações e serviços aparecem na criação com seleção, quantidade e preço por proposta.
- Itens e serviços pertencentes ao pacote são pré-selecionados e podem ficar marcados como `Incluso`.
- Configurações deixou de ser a tela principal de edição de preços comerciais; esses valores são tratados na negociação.
- Ao criar, a proposta é aberta no editor para ajustes finais, preview e PDF.

## Validação estática
- 58 arquivos TS/TSX processados pelo TypeScript `transpileModule`.
- 0 erros sintáticos.

A validação funcional final deve ser feita após executar a migração 04 no PostgreSQL e publicar o frontend.
