# Integração n8n / PostgreSQL / Gotenberg

## Fluxo

Browser -> `/api/atelier/*` no frontend -> proxy server-side -> n8n -> PostgreSQL / Gotenberg.

O proxy server-side evita dependência de CORS para POST, PATCH e PUT e mantém a URL do n8n fora dos componentes React.

## Endpoints utilizados

- GET `/health`
- GET `/dashboard/overview`
- GET/POST `/clients`
- GET/POST `/events`
- GET/POST/PATCH `/inventory`
- GET `/inventory/availability`
- GET `/services`
- PATCH `/services/:id`
- GET `/packages`
- PATCH `/packages/:id`
- GET/POST `/proposals`
- GET `/proposals/:id/preview`
- GET `/proposals/:id/pdf`
- GET/PATCH `/settings`

Todos são transformados pelo proxy em `/webhook/atelier/...` no n8n.

## URL do n8n

Fallback configurado em `src/server.ts`:

`https://n8n.facilities-ai.com.br/webhook/atelier`

Preferência para containers na mesma rede:

`N8N_WEBHOOK_BASE_URL=http://n8n:5678/webhook/atelier`

## Regra de teste

A interface não retorna para mock se a API falhar. Uma falha é exibida no topo da aplicação com o módulo que não respondeu.
