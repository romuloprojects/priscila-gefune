# V8.12 — Fotos em Clientes e Estoque + gestão de clientes

## Baseline
Implementado sobre o frontend real V8.11.4, mantendo o login que foi homologado em produção.

## Clientes
- foto opcional;
- miniatura circular no card;
- clique para ampliar;
- edição de nome, telefone, e-mail, observação e foto;
- remoção/troca da foto;
- exclusão com confirmação;
- exclusão lógica: preserva vínculos históricos com eventos e propostas.

## Estoque
- foto opcional no cadastro e na edição;
- miniatura substitui o ícone quando existe foto;
- clique para ampliar;
- fallback para o ícone dourado se não houver foto;
- foto também aparece no Estoque rápido da Home;
- perfil inventory pode gerenciar a foto do estoque, mas continua sem acesso ao valor padrão.

## Imagens
- aceita JPG, PNG e WEBP;
- origem limitada a 8 MB;
- redimensionamento no navegador para no máximo 640 px no maior lado;
- conversão para JPEG otimizado;
- payload final limitado a 450.000 caracteres;
- armazenado no PostgreSQL como data URL; não exige S3, MinIO ou storage externo.

## Backend / n8n
- migration 14 adiciona `atelier.clients.photo_url`;
- atualiza funções de cliente e estoque;
- novo `atelier.api_client_delete(uuid)`;
- workflow 10 ganha `DELETE atelier/client-delete?id=<uuid>`;
- endpoint novo exige role admin no n8n;
- RBAC do estoque permanece admin + inventory nos endpoints existentes.

## Validação
- TypeScript/TSX: 57 arquivos, 0 erros sintáticos no parser TypeScript 5.8.3.
- JSON n8n: 2 workflows válidos.
- Workflow 10: 5 webhooks, todos protegidos por `api_auth_authorize(...["admin"])`.
- Login V8.11.4: bloco `LoginPage` byte-a-byte equivalente ao baseline.
- `server.ts`, `__root.tsx` e `vite.config.ts`: sem alteração funcional em relação ao baseline.
- Chromium 1440x900: sem overflow horizontal.
- Chromium 1024x768: sem overflow horizontal.
- modal de edição em tablet: sem overflow horizontal.
- lightbox: abre ao clicar e fecha com Escape.
- processamento de upload executado no Chromium: `data:image/jpeg;base64,...`, 24435 caracteres, abaixo do limite.
