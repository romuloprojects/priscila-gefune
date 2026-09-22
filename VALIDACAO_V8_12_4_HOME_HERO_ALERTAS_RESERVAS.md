# VALIDAÇÃO V8.12.4 — Hero da Home + alertas de reservas

## Escopo
Alteração pontual sobre a V8.12.3, mantendo a arquitetura, API, autenticação, RBAC e regras de negócio da baseline V8.12.2.

## 1. Hero da Home
- A foto da Priscila foi recomposta em um banner específico para a proporção horizontal da Home.
- O novo asset mantém a Priscila inteira no enquadramento útil do lado direito, evitando o corte do rosto observado na V8.12.3.
- A metade esquerda foi escurecida e suavizada para manter leitura dos textos, aproximando o preenchimento visual do antigo banner floral.
- O layout e textos do hero não foram redesenhados.

Arquivo novo/substituído:
- `src/assets/priscila-home-hero.jpg`

## 2. Alertas de reservas
- Eventos cujo período de reserva ainda não terminou são consultados pelo endpoint existente `atelierApi.events.items(event.id)`.
- Só entram na lista de alertas de reserva eventos que realmente retornam ao menos 1 item reservado.
- O alerta informa:
  - `Reserva em andamento` quando o período já começou;
  - `Reserva programada` quando a retirada ainda está no futuro;
  - nome do evento;
  - quantidade de itens distintos;
  - quantidade total de peças;
  - período de retirada/devolução.
- Ao clicar no alerta, a interface navega para `Eventos`.
- Os alertas automáticos existentes do dashboard continuam sendo exibidos normalmente.
- A mensagem de “nenhum alerta” só aparece quando não existem alertas automáticos nem reservas encontradas.

## 3. Indicador no sino
- O contador/indicador geral considera também eventos com período de reserva não expirado, além dos alertas vindos do dashboard.
- A validação exata dos itens reservados continua sendo feita no card `Alertas importantes` via endpoint real de itens do evento.

## 4. Proteções verificadas
Os arquivos abaixo permanecem byte a byte iguais à baseline V8.12.2:
- `src/services/atelierApi.ts`
- `src/server.ts`
- `vite.config.ts`
- `package.json`

Nenhum endpoint, método, payload, cookie, regra de RBAC ou lógica server-side foi alterado.

## 5. Validação executada
- 57 arquivos TS/TSX processados com o compilador TypeScript em modo de transpile sintático.
- Resultado: 0 erros sintáticos/transpile.
- ZIP final testado para integridade.

### Limitação
Não foi executado build/runtime completo neste ambiente por indisponibilidade das dependências instaladas localmente. A validação efetuada foi estrutural, sintática, de integridade e comparação dos arquivos protegidos.
