# Atelier Priscila Gefune — V9.1

## Escopo
V9.1 consolidada sobre `atelier-frontend-producao-corrigido-v9.zip`, sem redesign adicional e sem alteração dos contratos n8n.

## Ajustes aplicados
1. **PDF de Reuniões com nome dinâmico**
   - Restaura o comportamento da V8.12.10.
   - Nome: `Relatorio_Reuniao_<Contato>_<DD-MM-AAAA>.pdf`.
   - A data é interpretada em `America/Sao_Paulo`.
   - Mantém fallback `Relatorio_Reuniao_Atelier_Priscila_Gefune.pdf`.

2. **Instagram no cadastro de Clientes**
   - Campo disponível ao criar/editar cliente.
   - Enviado no payload já aceito pela API existente.
   - Exibido no card do cliente e incluído na busca.

3. **Manter conectado no Login**
   - Checkbox ativado na tela.
   - Valor enviado ao terceiro argumento de `atelierApi.auth.login(...)`.
   - Reutiliza a regra server-side já existente de 30 dias vs. 12 horas.

4. **Acesso a Configurações**
   - Página já existente tornou-se acessível pelo ícone de engrenagem no header para `admin`.
   - Hash `#configuracoes` reconhecido em reload/navegação.
   - Perfil `inventory` continua sem acesso à área.

5. **Tipografia editorial real**
   - Interface V9 passa a usar os fonts já carregados pelo projeto:
     - `Cormorant Garamond` em títulos/marca.
     - `Manrope` na interface.
   - Fallbacks continuam definidos.

## Arquivos de produção alterados
- `src/routes/index.tsx`
- `src/server.ts`
- `src/atelier-design.css`

## Testes
- `tests/proxy.test.ts` recebeu teste do nome dinâmico de PDF de Reuniões.
- Transpile/sintaxe: **59 arquivos TS/TSX, 0 erros**.
- Proxy/API: **13/13 testes aprovados**.
- Teste adicional confirma `Relatorio_Reuniao_Evelly_Maicom_22-09-2026.pdf`.

## Integridade
Os arquivos abaixo permaneceram byte a byte iguais à V9 recebida:
- `src/services/atelierApi.ts`
- `vite.config.ts`
- `package.json`
- `package-lock.json`

## Limitação da validação neste ambiente
A instalação completa de `node_modules` excedeu o tempo disponível do ambiente, portanto o `npm run build` não foi reproduzido nesta rodada. A V9 de origem já continha sua validação de build; nesta V9.1 foram executados testes de transpile e a suíte de proxy/API focada nas alterações.
