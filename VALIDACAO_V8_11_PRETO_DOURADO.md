# V8.11 - Preto + Dourado

Baseline funcional: V8.10 RBAC Estoque.
Baseline visual: homologacao real preto+dourado V3 aprovada em 2026-09-19.

Alteracoes intencionais:
- tokens semanticos globais migrados para preto/grafite + dourado/champagne;
- sidebar usa logo preto+dourado fornecido pela cliente;
- login V8.4 preserva estrutura e imagem homologada, com painel/inputs/botao no novo tema;
- Home, Eventos, Estoque, Propostas, Clientes e Reunioes herdam o novo tema sem alterar logica;
- perfil inventory continua sem valores e com acesso apenas ao Estoque;
- modal de Reunioes e modal de preview ajustados para superficies escuras;
- vite.config.ts preservado.

A logica de API, autenticacao, RBAC, reservas, propostas, reunioes e endpoints nao foi alterada.
