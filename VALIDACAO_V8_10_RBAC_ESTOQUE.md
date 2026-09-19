# Validação V8.10 — Perfil exclusivo de Estoque

## Usuários
- `priscila.gefune` → `admin`
- `estoque` → `inventory`

## Perfil inventory
- Menu mostra somente `Estoque`.
- Login redireciona diretamente para `Estoque`.
- Não carrega Dashboard, Clientes, Eventos, Propostas, Serviços, Pacotes, Reuniões ou Configurações.
- Não mostra botão `Novo evento`.
- Não mostra alertas comerciais.
- Pode listar, criar e editar itens de estoque.
- Valor padrão do item não aparece na interface.
- Requisições de escrita do perfil inventory têm `default_unit_price` removido no proxy.
- Respostas de estoque para inventory têm `default_unit_price` removido no proxy.
- O proxy retorna 403 para qualquer endpoint fora do allowlist de estoque.

## Backend
- Webhooks comerciais exigem role `admin`.
- Webhooks 30/31/32 aceitam `admin` ou `inventory`.
- A autorização ocorre dentro do primeiro Postgres de cada webhook.
- Chamadas diretas ao n8n sem Bearer token não retornam dados de negócio.

## Compatibilidade
- PostgreSQL incremental; não apaga dados.
- n8n 2.36.8: Webhook 2.1 / Postgres 2.7 / Code 2 preservados.
