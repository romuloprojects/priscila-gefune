# Validação V8.7 — total manual de proposta

Correções:
- Em `pricing_mode = manual`, o card TOTAL passa a refletir imediatamente `manual_total`.
- O payload de salvamento envia `manual_total` explicitamente como número.
- Em modo automático, o card continua exibindo `data.total` calculado pelo backend.
- Nenhuma alteração nos demais módulos.

Motivo:
O campo editável atualiza `manual_total`, mas o card antigo mostrava apenas `total`.
Assim, antes da resposta recalculada do backend o valor visual permanecia antigo.
