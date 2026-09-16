# Atelier Priscila Gefune — Mock de Validação V5

Esta versão parte da V4, mas reconstrói a camada visual principal conforme as telas homologadas em 15/09/2026.

## Telas homologadas implementadas

### Início
- Sidebar escura fixa com logo oficial contida.
- Header escuro com busca, notificações e perfil PG.
- Hero escuro com composição floral e mensagem de boas-vindas.
- 4 KPIs em cards ivory.
- Próximos eventos em card claro.
- Estoque rápido em lista simples.
- Ações rápidas verticais.
- Propostas recentes.
- Alertas importantes.
- Rodapé institucional.

### Eventos
- Identidade visual igual à Home.
- 3 KPIs de resumo e botão Novo evento.
- Busca e filtros de status/mês.
- Lista de eventos com data, cliente, local, status e ação.
- Agenda mensal visual.
- Card institucional lateral.

### Estoque
- Identidade visual igual à Home.
- Busca e filtros de categoria/status.
- 4 KPIs de estoque.
- Lista de itens em formato de tabela leve.
- Itens com atenção.
- Últimas movimentações.
- Botão Adicionar item.

## Demais telas
Propostas, Clientes e Configurações continuam mockadas e foram alinhadas à nova linguagem visual para não quebrar a experiência. A próxima homologação pode detalhar essas páginas antes da integração com backend.

## Dados
Todos os dados continuam mockados em `src/data/mockData.ts`.

## Configuração de deploy
`vite.config.ts` preserva explicitamente:

```ts
allowedHosts: ["priscila-gefune.facilities-ai.com.br"]
```

## Backend
Não há integração com n8n/PostgreSQL nesta versão.

## Validação técnica
- Todos os 58 arquivos TS/TSX passaram por transpile sintático sem erros.
- O `npm install` não concluiu dentro do limite do ambiente de execução, portanto o build completo ainda deve ser validado no ambiente de publicação/Lovable antes de considerar esta versão final.
