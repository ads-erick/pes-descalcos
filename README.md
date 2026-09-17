# Pés Descalços

Plataforma (de brincadeira) do grupo de futebol com os amigos: cadastro de jogadores com "cartinha" de estatísticas, registro dos futs (gols, assistências, presença) e seleção automática dos melhores de cada fut.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- Postgres (Supabase) como banco de dados
- Deploy: Vercel

## Modelo de dados

Três tabelas (ver `supabase/migrations/0001_init.sql`):

- **jogador** — cadastro (nome, apelido, número, foto, posição, se está ativo no grupo)
- **fut** — cada partida (data, placar time branco x time preto)
- **participacao** — stats de um jogador em um fut específico (de que lado jogou, gols, assistências, presença)

Não existe uma tabela de "times": os lados de cada fut são só `branco`/`preto`, escolhidos a cada partida. A "seleção do fut" é calculada dinamicamente a partir das stats em `participacao`, não fica persistida no banco.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencher as variáveis (ver abaixo)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

| Variável | Onde pegar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Connect |
| `DATABASE_URL` | Supabase → Connect → Connection String (URI). Caracteres especiais da senha precisam ser codificados (`@` → `%40`) |
| `ADMIN_PASSWORD` | Senha de quem lança os dados, escolhida por vocês |
| `ADMIN_SESSION_SECRET` | Qualquer valor aleatório: `openssl rand -base64 32` |

### Banco de dados

As migrações ficam em `supabase/migrations/` e são aplicadas em ordem:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f supabase/migrations/0001_init.sql
```

As tabelas têm RLS ativado sem policies: a chave publishable do Supabase não lê nem escreve nada. Todo acesso passa pelo servidor do Next.js (`src/data/`), usando a `DATABASE_URL`.

## Estrutura

- `src/app/` — rotas e Server Actions
- `src/data/` — camada de acesso a dados (só roda no servidor): queries, autenticação de admin
- `src/components/` — componentes visuais (ex: cartinha do jogador)
- `src/lib/` — constantes e helpers compartilhados entre servidor e cliente

## Admin

A lista de jogadores é pública. Para cadastrar, entre em `/admin/login` com a `ADMIN_PASSWORD`. A sessão fica num cookie assinado por 30 dias.

## Workflow de contribuição

Projeto pessoal, mas seguindo boas práticas:

- `main` sempre estável e protegida — nada é commitado direto nela
- Uma branch por mudança, prefixada por tipo: `feat/`, `fix/`, `chore/`, `docs/`
- Commits seguindo [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`...)
- Toda mudança vira Pull Request para `main`, revisado e aprovado manualmente antes do merge
- CI (`.github/workflows/ci.yml`) roda lint e build em toda PR
