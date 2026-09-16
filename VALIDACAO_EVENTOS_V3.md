# Validação Eventos V3

Alterações aplicadas sem mudar o layout base homologado:

- Botão **Detalhes** agora consulta `GET /api/atelier/events/:id` e abre editor real.
- Detalhes permite editar cliente vinculado, status, data, convidados, locais, período opcional e observações.
- **Excluir evento** usa `DELETE /api/atelier/events/:id` com confirmação.
- Período de retirada/devolução deixou de ser preenchido automaticamente com a data do evento.
- As duas datas são opcionais, mas devem ser preenchidas em conjunto.
- Evento sem período mostra **Sem reserva do acervo**.
- Evento sem período usa o botão **Adicionar acervo**, que leva aos Detalhes para configurar o período antes de reservar itens.
- Novos eventos usam `Confirmado` como status inicial, mas o status é editável.
- O status legado `draft` aparece como **Planejado** na agenda.

Validação local disponível neste ambiente:

- 57 arquivos TS/TSX analisados pelo compilador TypeScript via `transpileModule`.
- 0 erros sintáticos.
- Build completo não foi executado por ausência das dependências `node_modules` no ambiente de geração.
