# V8.12.2 — reserva de itens + nome dinâmico do PDF

## PDF
O workflow 53 já produzia `download_filename` corretamente e também alterava
`binary.data.fileName`, porém o Webhook binário do n8n não estava entregando esse
metadata como `Content-Disposition`.

O proxy `src/server.ts` tinha um fallback fixo:
`proposta-atelier-priscila-gefune.pdf`.

A V8.12.2 remove esse fallback fixo para propostas. Ao servir `/proposal-pdf`,
o proxy consulta `/proposal-detail?id=<uuid>` com a mesma sessão, obtém cliente e
data do evento e responde com:

`Proposta_Nome_Do_Cliente_DD-MM-AAAA.pdf`

Se não houver data:
`Proposta_Nome_Do_Cliente_sem-data.pdf`

## Reserva de itens
A correção do workflow 21 está no patch n8n separado. Nenhuma alteração de banco é necessária.
