# Atelier Priscila Gefune — Frontend de produção V9

Código-fonte do frontend com as seis abas e a identidade visual aprovada: fotos da Priscila, preto e dourado luminoso, navegação responsiva e ícones interativos.

## Instalação e build

Use Node.js 22.12+ ou 24 LTS e npm. Verificado neste ambiente com Node 24.15.0.

```sh
npm ci
npm run check
npm run build
```

Configure `N8N_WEBHOOK_BASE_URL` no ambiente do servidor conforme `.env.example`. Mantenha os valores de ambiente e o domínio da instalação atual. O navegador continua usando `/api/atelier/*`; os webhooks e os IDs por query/body foram preservados. O endereço n8n existente continua como fallback, sem credenciais embutidas.

## Publicação

Este ZIP contém o projeto de produção completo, não a prévia HTML. Substitua o código-fonte no processo de implantação atual e faça um novo build. Não substitua apenas o HTML de um servidor estático: a autenticação e o proxy dependem do servidor TanStack Start.

A configuração original de build foi mantida. Neste ambiente ela gera Nitro com preset `cloudflare-module`, com servidor em `.output/server` e arquivos públicos em `.output/public`. Use a integração Cloudflare/Workers do provedor atual para publicar esse resultado. Se a hospedagem atual for Docker/Node, confirme e configure o preset Nitro adequado à hospedagem antes de publicar; o resultado Cloudflare não é um servidor Node autônomo.

Antes da troca, mantenha uma cópia da versão atual e das variáveis de ambiente. Após publicar, valide login, consulta do estoque, uma edição controlada, uma proposta, PDF e relatório de reunião no seu backend. Não há migração de banco nem workflow n8n neste pacote. O rollback consiste em republicar a versão anterior.

## Conteúdo

- `src`: aplicação e proxy autenticado.
- `tests` e `scripts/test.mjs`: testes de regressão locais, com backend simulado somente durante os testes.
- `package-lock.json`: dependências fixadas para `npm ci`.
- `VALIDACAO.md`: correções, resultados e limites dos testes.
- `INTEGRACAO_N8N.md`: referência de integração herdada.

Não contém modo de demonstração, dados fictícios no runtime, `node_modules`, segredos ou arquivos de build dependentes da máquina. O build deve ser executado no ambiente de implantação.
