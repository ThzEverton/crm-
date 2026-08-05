# Fase 1 — Fundação

## Objetivo

Estabelecer uma aplicação server-rendered modular, segura por padrão, instalável e preparada para PostgreSQL e Render, sem antecipar autenticação ou regras clínicas.

## Tabelas

Nenhuma tabela de domínio foi criada. A migration de fundação só inaugura o histórico do Prisma, que cria sua tabela interna `_prisma_migrations` quando aplicada. Esta decisão evita um schema prematuro e garante que `clinic_id` não seja introduzido.

## Rotas

| Método | Rota | Responsabilidade |
| --- | --- | --- |
| GET | `/` | Renderizar o painel real da fundação |
| GET | `/patient-app` | Renderizar a casca pública da PWA |
| GET | `/health` | Confirmar que o processo HTTP está vivo |
| GET | `/ready` | Confirmar a conexão com PostgreSQL |

## Regras

- Não persistir dados clínicos no navegador.
- Não incluir páginas dinâmicas no cache do service worker.
- Não registrar segredos, cookies, tokens, senhas ou dados clínicos.
- Validar todas as variáveis de ambiente antes de subir o processo.
- Manter regras fora de routes e views.
- Encerrar o servidor e o Prisma de forma graciosa.

## Critérios de aceite

- [x] Node.js, TypeScript, Express e EJS configurados.
- [x] Organização MVC modular criada.
- [x] Prisma 7 configurado para PostgreSQL e migration versionada; o ping de readiness usa o driver `pg` enquanto não existem modelos.
- [x] Variáveis de ambiente validadas com Zod.
- [x] Layout clínico responsivo com foco visível e menu móvel.
- [x] Manifesto, ícones, service worker e tela offline.
- [x] Cache restrito a ativos públicos.
- [x] Health check e readiness separados.
- [x] Erros HTML/JSON e 404 tratados.
- [x] Logs JSON com redação de campos sensíveis.
- [x] Testes iniciais e documentação de execução/deploy.

## Fora do escopo

Login, sessões, perfis, pacientes e qualquer dado clínico. A Fase 2 só deve começar após aprovação explícita desta entrega.
