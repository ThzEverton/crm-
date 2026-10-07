# CRM Nutricionista

Sistema comercial para organizar a operação de um nutricionista, desenvolvido com foco em **arquitetura em camadas, qualidade de código e evolução segura do produto**.

> Status atual: **Fase 1** — fundação técnica, persistência, estrutura web e preparação para as próximas entidades do domínio.

## Stack

- Node.js 22+
- TypeScript
- Express 5
- EJS
- Prisma ORM
- PostgreSQL
- Zod
- Vitest
- Playwright Core
- Render

## Arquitetura

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Prisma / PostgreSQL
```

Além da camada de aplicação, o projeto possui `views`, `partials`, middlewares e uma estrutura pública preparada para PWA.

## Qualidade e validação

- Build TypeScript antes da publicação.
- Testes automatizados com Vitest.
- Smoke tests E2E em desktop e mobile.
- Auditoria das dependências de produção.
- Endpoints separados de health check e readiness.

```bash
npm run check
npm run test:e2e
```

## Executando localmente

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Rotas úteis:

- `GET /health` — processo HTTP ativo.
- `GET /ready` — valida conexão com PostgreSQL.
- `GET /patient-app` — estrutura pública da PWA.

## Documentação

- [`docs/PHASE-1.md`](./docs/PHASE-1.md) — escopo e critérios de aceite.
- [`docs/DEPLOY.md`](./docs/DEPLOY.md) — deploy, backup e recuperação.

O protótipo React/Vite anterior foi preservado em `prototype/legacy-vite` apenas como referência e não participa do runtime atual.
