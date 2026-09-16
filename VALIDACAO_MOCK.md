# Lumè Eventos — versão mock para validação

Esta versão é exclusivamente visual/funcional para homologação do fluxo antes da integração com n8n e PostgreSQL.

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
Os mocks ficam centralizados em `src/data/mockData.ts` para facilitar a futura troca por APIs.

## Próxima etapa após aprovação visual
1. Fechar campos definitivos de Evento, Estoque, Cliente e Proposta.
2. Modelar PostgreSQL.
3. Criar APIs no n8n.
4. Substituir mocks pelas APIs.
5. Implementar reserva de estoque por intervalo de datas e geração real de PDF.
