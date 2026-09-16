# Atelier Priscila Gefune — mock visual para validação

Esta versão mantém os dados mockados e os fluxos de demonstração da V1, mas aplica a identidade visual aprovada para o Atelier Priscila Gefune.

## Direção visual aplicada
- Sidebar e header em preto/grafite quente.
- Champagne/dourado como cor de marca e destaque.
- Ivory nos KPIs de resumo.
- Verde sálvia apenas para estados positivos.
- Rosé/coral discreto para alertas e pendências.
- Tipografia Cormorant Garamond + Manrope.
- Detalhes Art Déco discretos inspirados na moldura da marca.
- Logo original da cliente em `src/assets/atelier-priscila-gefune-logo.jpeg`.

## O que está navegável
- Início
- Eventos
- Estoque
- Propostas
- Clientes
- Configurações

## Interações simuladas
- Novo evento
- Adicionar item ao estoque
- Nova proposta / gerar PDF (prévia simulada)
- Novo cliente
- Busca contextual por tela
- Filtros simples de eventos, estoque e propostas
- Alertas e botões de detalhe com feedback visual

## Dados
Os mocks continuam centralizados em `src/data/mockData.ts`, prontos para futura substituição por APIs do n8n/PostgreSQL.

## Observação de validação
A instalação completa de dependências não concluiu dentro do limite do ambiente. A sintaxe de todos os arquivos TS/TSX foi validada via TypeScript `transpileModule`, sem erros sintáticos. Faça a validação final de runtime no Lovable ou em ambiente Node com `npm install` e `npm run dev`.

## Próxima etapa após aprovação visual
1. Ajustes finos de identidade e conteúdo.
2. Fechar campos definitivos de Evento, Estoque, Cliente e Proposta.
3. Modelar PostgreSQL.
4. Criar APIs no n8n.
5. Substituir mocks pelas APIs.
6. Implementar reserva de estoque por intervalo de datas e geração real de PDF.
