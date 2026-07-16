# Transportadora 3E

Sistema de gestão de pagamentos da Transportadora 3E: painel do cliente
(consultar serviços contratados, pagar via Pix ou dinheiro, anexar
comprovante) e painel administrativo (validar comprovantes, cadastrar
clientes/serviços, acompanhar o financeiro, auditoria completa de
pagamentos).

## Stack

- **Next.js 16** (App Router) + TypeScript, front e back no mesmo projeto
  (Server Actions no lugar de uma API REST separada)
- **Tailwind CSS v4** — paleta e tokens de design centralizados em
  `src/app/globals.css`, com tema claro/escuro no painel do cliente
- **MySQL** (via XAMPP) + **Prisma 7** como ORM
- **Vitest** — inclui testes de integração que rodam contra o MySQL real
  (não mocado)

> Next.js 16 e Prisma 7 têm mudanças relevantes em relação a versões mais
> antigas/comuns em tutoriais. Ver `AGENTS.md` antes de mexer em algo que
> pareça "óbvio" mas não bater com o comportamento esperado.

## Estrutura de telas

**Cliente** (`/entrar`, `/painel/*`):
`/painel` (dashboard) · `/painel/em-aberto` · `/painel/extrato` ·
`/painel/servicos/[id]` (pagar) · `/painel/servicos/[id]/detalhes`

**Admin** (`/admin/entrar`, `/admin/*`):
`/admin` (fila de comprovantes pendentes) · `/admin/financeiro` ·
`/admin/clientes` (+ `/novo`, `/[id]`) · `/admin/auditoria`

`_legacy-php-reference/` guarda o protótipo PHP original — só como
referência visual/de fluxo, não faz parte do app.

## Setup local

Pré-requisitos: Node.js, MySQL rodando (XAMPP já cobre isso).

```bash
npm install

# copie/configure o .env com a URL do seu MySQL:
# DATABASE_URL="mysql://root:@127.0.0.1:3306/transportadora3e"

npx prisma migrate dev      # cria as tabelas
npx tsx prisma/seed.ts      # cria o admin inicial + perfil do negócio
                             # (anote a senha gerada, só aparece uma vez)

npm run dev
```

Depois, cadastre os clientes de verdade pelo próprio painel admin
(`/admin/clientes/novo`) — não existe cadastro de cliente fora da UI.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes (unitários + integração contra o MySQL real) |
| `npm run db:backup` | Backup do banco + comprovantes (ver abaixo) |

## Variáveis de ambiente

- `DATABASE_URL` (obrigatória) — string de conexão do MySQL
- `ADMIN_SEED_USERNAME`, `ADMIN_SEED_PASSWORD` (opcionais, só pro seed) —
  se não definidas, o seed usa `evaldo` como usuário e gera uma senha
  aleatória forte, mostrada uma vez no terminal

## Testes

`npm test` roda tudo, incluindo **testes de integração reais** (em
`src/lib/actions/*.test.ts`) que criam/apagam registros no MySQL
configurado em `DATABASE_URL` — cada teste usa um `doc_number` único e
limpa tudo no `afterEach`, mas exige o banco rodando e alcançável. Não
existe suite "só unitária" separada hoje; se precisar rodar sem banco
disponível, filtre por arquivo (`npx vitest run src/lib/money.test.ts`
etc.) evitando `src/lib/actions/`.

## Backup e recuperação

Dinheiro real está em jogo — não depender só da memória de "fazer backup
de vez em quando".

```bash
npm run db:backup
```

Isso cria em `backups/` (fora do git, contém dados reais):
- um `.sql` com o dump completo do banco (`mysqldump --single-transaction`,
  não trava o site enquanto roda)
- uma cópia da pasta `storage/comprovantes/` daquele momento — os
  comprovantes em si são a evidência do pagamento, tão importantes quanto
  a linha do banco que aponta pra eles

Para restaurar (**apaga e substitui** os dados atuais — pede confirmação
explícita digitando `CONFIRMAR`):

```powershell
.\scripts\restore-database.ps1 -SqlFile ".\backups\transportadora3e_2026-07-15_224816.sql"
```

Depois de restaurar o banco, copie manualmente a pasta
`comprovantes_<timestamp>` correspondente de volta pra
`storage/comprovantes/`.

**Recomendação:** rode `npm run db:backup` com alguma regularidade (ex.:
diariamente, via Agendador de Tarefas do Windows apontando pro
`npm run db:backup` dentro da pasta do projeto) e guarde cópias fora
desta máquina de vez em quando — um backup que só existe no mesmo HD do
banco não protege contra o HD falhar.

## Segurança

Resumo do que está implementado (detalhes e o raciocínio de cada decisão
estão nos comentários do próprio código e nas mensagens de commit):

- Senhas com bcrypt (custo 12); nenhuma senha em texto puro em lugar
  nenhum, nem em log
- Sessão via cookie httpOnly + `sameSite=lax`, banco guarda só o hash do
  token de sessão
- Bloqueio de conta após 5 tentativas de login inválidas (15 min) +
  rate limit por IP (20 tentativas / 5 min) nas duas telas de login
- Isolamento rígido: cliente só acessa dados vinculados ao `clientId` da
  própria sessão, nunca a um ID vindo da requisição
- Todo valor monetário usa `Decimal`, nunca `float`
- Toda mudança de status de pagamento é auditada (`/admin/auditoria`):
  quem, quando, valor antes/depois
- Upload de comprovante: tipo e tamanho validados, nome de arquivo
  sempre gerado pelo servidor, arquivo fora de `public/`
  (servido só por rota autenticada que confere o dono)
- Headers de segurança (CSP, X-Frame-Options, etc.) em `next.config.ts`
- `npm audit`: vulnerabilidades conhecidas são todas em dependências de
  build/dev-tooling internas do Next/Prisma, não em código exposto a
  usuário final — ver commit da Etapa 9 para o detalhamento

## Testado com

Fluxos críticos (login, pagamento, aprovação/rejeição, isolamento entre
clientes) têm testes automatizados. Verificações de UI/visual foram
feitas com screenshots reais via Chrome headless (claro/escuro, desktop
e mobile) durante o desenvolvimento — não há suite de testes E2E de UI
no repositório.
