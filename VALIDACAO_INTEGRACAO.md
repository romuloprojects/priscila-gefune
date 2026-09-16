# Validação — integração real n8n / PostgreSQL / Gotenberg

Versão preparada para o backend `atelier-priscila-backend-n8n-2.36.8-v1`.

## Validações executadas

- 58 arquivos TS/TSX processados pelo compilador TypeScript em modo `transpileModule`.
- 0 arquivos com erro sintático.
- 27 combinações de método + rota usadas pelo frontend comparadas com os Webhook nodes dos workflows n8n.
- 27/27 rotas encontradas no pacote backend.
- `mockData.ts` removido e nenhuma tela faz fallback silencioso para dados mockados.
- `vite.config.ts` preservado, incluindo `allowedHosts: ["priscila-gefune.facilities-ai.com.br"]`.
- O acesso do navegador ao n8n foi encapsulado em `/api/atelier/*` no `src/server.ts`, evitando CORS/preflight em POST/PATCH/PUT.
- URL n8n pública configurada como fallback: `https://n8n.facilities-ai.com.br/webhook/atelier`.
- Suporte a URL interna Docker via `N8N_WEBHOOK_BASE_URL`.

## Funções conectadas

- healthcheck;
- dashboard;
- cadastro/listagem de clientes;
- cadastro/listagem de eventos;
- catálogo e edição de estoque;
- disponibilidade por período;
- edição transacional de reserva de itens do evento;
- pacotes e edição de preço padrão;
- serviços e edição de preço padrão;
- criação/listagem/edição de proposta;
- seleção de seções/itens/serviços exibidos no PDF;
- edição de quantidade e valor da proposta;
- recálculo no PostgreSQL ao salvar;
- reserva de estoque a partir da proposta;
- preview HTML;
- PDF pelo workflow Gotenberg;
- configurações da empresa.

## Limite da validação neste ambiente

O ambiente de construção não conseguiu resolver DNS para `n8n.facilities-ai.com.br`, portanto não foi possível fazer uma execução HTTP real contra a instância do usuário daqui. A compatibilidade de contrato foi validada diretamente contra os JSONs dos workflows fornecidos/gerados.

A instalação das dependências (`npm install`) também não concluiu dentro do limite do ambiente, então o build Vite completo deve ser validado no ambiente de deploy. A validação sintática TypeScript passou sem erros.

## Teste recomendado após publicar

1. Verificar indicador `Dados reais · PostgreSQL + n8n + Gotenberg conectados`.
2. Em Estoque, informar quantidades físicas reais de pelo menos dois itens.
3. Criar cliente.
4. Criar evento com retirada/devolução.
5. Abrir `Itens / reserva` e reservar quantidades.
6. Criar segundo evento sobreposto e validar conflito de estoque.
7. Criar proposta usando pacote.
8. Abrir `Editar`, marcar/desmarcar itens e alterar valores.
9. Salvar e conferir recálculo.
10. Abrir Prévia e PDF.
