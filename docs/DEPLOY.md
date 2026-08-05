# Deploy no Render

O `render.yaml` declara o Web Service e o PostgreSQL gerenciado.

## Fluxo

1. Conecte o repositório ao Render e crie o Blueprint a partir de `render.yaml`.
2. Confirme que `DATABASE_URL` aponta para o banco gerenciado.
3. O build executa `npm ci`, gera o Prisma Client e compila TypeScript.
4. O pre-deploy aplica `prisma migrate deploy` uma única vez.
5. O serviço inicia com `npm start` em `0.0.0.0:$PORT`.
6. O Render monitora `GET /health`; monitoração interna pode usar `GET /ready`.

O PostgreSQL está fixado na versão 18 e bloqueia conexões externas com `ipAllowList: []`; a aplicação usa a conexão privada fornecida pelo Blueprint. O auto-deploy só ocorre após os checks passarem.

`SESSION_SECRET` já é provisionado no Blueprint, embora seu uso comece na Fase 2. Nunca copie valores reais para `.env.example`.

## Backup e recuperação

- Habilitar backups diários do PostgreSQL gerenciado antes de inserir dados reais.
- Reter no mínimo 14 restaurações diárias e uma restauração mensal por 12 meses, ajustando a política após análise LGPD.
- Criptografar backups e restringir acesso ao titular técnico do consultório.
- Testar restauração trimestralmente em banco isolado, nunca sobre produção.
- Registrar data, responsável, duração e resultado do teste de restauração.
- Antes de migration destrutiva futura, gerar backup verificável e documentar rollback.

Arquivos clínicos usarão armazenamento externo privado em uma fase posterior e exigirão política própria de backup e retenção.
