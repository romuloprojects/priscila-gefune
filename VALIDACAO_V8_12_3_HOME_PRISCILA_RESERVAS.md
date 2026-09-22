# VALIDAÇÃO V8.12.3 — Home com foto da Priscila + reservas mais explícitas

## Escopo aplicado
Alterações pontuais sobre a baseline **V8.12.2**, sem redesign geral, preservando contratos da API, `atelierApi.ts`, `server.ts`, autenticação, RBAC e regras de negócio.

### 1) Home
- Substituída a imagem floral do banner principal da Home pela foto homologada da Priscila.
- O preenchimento foi mantido em estilo semelhante ao banner anterior, usando `object-cover` e posicionamento para privilegiar a composição à direita.
- Mantidos texto, overlay e comportamento geral do hero.

### 2) Eventos com reserva mais explícita
#### Na Home (`Próximos eventos`)
- Para eventos exibidos na Home que possuem período de reserva (`reserve_from` + `reserve_until`), a interface agora consulta os itens do evento pelo endpoint já existente `atelierApi.events.items(event.id)`.
- Exibe selo com:
  - `1 item reservado`, `N itens reservados`, ou
  - `Acervo reservado` quando há período, mas não foi possível determinar itens.
- Exibe também o período da reserva do acervo.
- Quando não há reserva, mostra `Sem itens reservados`.

#### Na página `Eventos`
- O texto de reserva foi deixado mais explícito:
  - `Reserva do acervo: ...`
  - `Sem itens reservados no acervo`
- Adicionado selo visual:
  - `Evento com reserva de acervo`
  - `Evento sem reserva de acervo`

## Arquivos alterados
- `src/routes/index.tsx`
- `src/assets/priscila-home-hero.jpg` (novo asset)

## Observações
- Mudança focada apenas na camada visual/comportamental do frontend.
- Nenhum endpoint novo foi criado.
- Nenhum payload foi alterado.
- Nenhuma regra de sessão, RBAC ou proxy server-side foi modificada.
