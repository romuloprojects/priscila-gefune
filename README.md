# Atelier Priscila Gefune — Gestão de Eventos

Frontend TanStack Start integrado ao backend real do Atelier Priscila Gefune.

## Backend

O navegador chama rotas same-origin em `/api/atelier/*`. O `src/server.ts` encaminha essas requisições para os webhooks de produção do n8n.

URL padrão:

`https://n8n.facilities-ai.com.br/webhook/atelier`

Para usar a rede Docker interna, configure no container do frontend:

`N8N_WEBHOOK_BASE_URL=http://n8n:5678/webhook/atelier`

A URL pública permanece como fallback caso a variável não esteja definida.

## Dados reais

Não há fallback para mocks. Erros de API aparecem na interface para facilitar os testes de integração.

Integrações atuais:

- Dashboard
- Clientes
- Eventos
- Estoque e disponibilidade de hoje
- Pacotes
- Serviços
- Propostas
- Preview HTML de proposta
- PDF via Gotenberg
- Configurações da empresa

## Observação sobre estoque inicial

O seed do PostgreSQL cadastrou itens e valores observados nos orçamentos fornecidos, mas as quantidades físicas iniciam em zero. Ajuste cada item em **Estoque > Editar item** antes de testar conflitos de reserva.


## Atualização V5 - compatibilidade com Webhooks de produção do n8n

As chamadas de detalhe/edição não usam mais segmentos dinâmicos (`:id`) nos Webhooks do n8n. O frontend usa endpoints estáticos e envia IDs por query string ou body. Isso corrige os 404 `requested webhook is not registered` observados no editor de propostas e nos detalhes de eventos.

## Atualização V6 - propostas

A proposta pode usar `Valor final` (padrão) ou `Somar detalhes`. Preços individuais são opcionais e podem permanecer somente como controle interno. A Priscila escolhe se preços de itens e/ou serviços aparecem no PDF.
