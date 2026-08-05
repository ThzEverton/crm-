# CRM Nutricionista

Fundação do sistema comercial para um único nutricionista. A Fase 1 usa Node.js, TypeScript, Express, EJS, Prisma e PostgreSQL. Autenticação e entidades clínicas ainda não fazem parte desta versão.

## Requisitos

- Node.js 22 ou superior (Node 24 recomendado)
- PostgreSQL 15 ou superior

## Execução local

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run db:migrate
npm.cmd run dev
```

Abra `http://localhost:3000`. As rotas de operação são:

- `GET /health`: processo HTTP ativo, usado pelo Render.
- `GET /ready`: testa a conexão com o PostgreSQL.
- `GET /patient-app`: casca instalável da PWA.

## Validação

```powershell
npm.cmd run check
npm.cmd run test:e2e
```

`check` compila o TypeScript, executa os testes e audita dependências de produção. `test:e2e` abre Chrome em viewports desktop/mobile e verifica console, navegação e overflow. `npm run prisma:validate` valida o schema pelo CLI do Prisma; esse comando precisa alcançar o host oficial de engines do Prisma.

## Arquitetura

- `routes` recebem requisições;
- `controllers` coordenam respostas;
- `services` concentram regras de aplicação;
- `repositories` isolam o Prisma;
- `views` e `partials` renderizam a interface EJS;
- `middlewares` cuidam do ciclo HTTP;
- `public` contém somente a estrutura pública da PWA.

O protótipo React/Vite anterior foi preservado em `prototype/legacy-vite` apenas como referência. Ele não participa do build nem do runtime.

Consulte [docs/PHASE-1.md](docs/PHASE-1.md) para critérios de aceite e [docs/DEPLOY.md](docs/DEPLOY.md) para o Render, backup e recuperação.
