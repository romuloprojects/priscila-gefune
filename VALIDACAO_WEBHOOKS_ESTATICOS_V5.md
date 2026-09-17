# Validação V5 — Webhooks estáticos para n8n 2.36.8

## Motivo
No n8n, Webhook nodes com parâmetros de rota como `:id` podem ter a URL de produção registrada com um `webhookId` adicional. Isso fazia chamadas como `/webhook/atelier/proposals/<uuid>` retornarem 404 `not registered`, embora o workflow estivesse ativo.

## Correção
Todos os endpoints usados pelo frontend que dependiam de `:id` foram convertidos para paths estáticos. IDs agora trafegam por query string em GET/DELETE e no body em PATCH/PUT/POST.

Exemplos:
- `GET /atelier/proposal-detail?id=<uuid>`
- `PATCH /atelier/proposal-update` com `{ id, ... }`
- `GET /atelier/event-detail?id=<uuid>`
- `PUT /atelier/event-items` com `{ event_id, items }`

Nenhuma migração PostgreSQL é necessária para esta correção.
