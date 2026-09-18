# Validação V8.6 — Home / Reuniões

Alterações:
- Adicionado quinto KPI `Reuniões realizadas` no topo da Home.
- Contagem deriva da lista real de reuniões já carregada da API (`meetings.length`), sem alteração de workflow/backend.
- Grade de KPIs: 2 colunas em telas pequenas, 3 em intermediárias e 5 em desktop largo.
- Em Ações rápidas, `Novo cliente` foi substituído por `Nova reunião`.
- `Nova reunião` abre diretamente a página Reuniões com o modal homologado já aberto.
- Cadastro de cliente continua disponível normalmente pela aba Clientes.
- Nenhuma alteração em n8n/PostgreSQL, propostas, eventos, estoque, autenticação ou PDFs.

Validações executadas:
- Estrutura de props HomePage/MeetingsPage revisada.
- Uso de meetings.length confirmado.
- Novo gatilho de abertura do modal é monotônico (`meetingCreateToken`) e não conflita com o botão local da página.
- Não foram criados novos endpoints.
- vite.config.ts preservado.
