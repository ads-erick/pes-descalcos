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
cp .env.example .env.local   # preencher com as credenciais do Supabase
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Workflow de contribuição

Projeto pessoal, mas seguindo boas práticas:

- `main` sempre estável e protegida — nada é commitado direto nela
- Uma branch por mudança, prefixada por tipo: `feat/`, `fix/`, `chore/`, `docs/`
- Commits seguindo [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`...)
- Toda mudança vira Pull Request para `main`, revisado e aprovado manualmente antes do merge
- CI (`.github/workflows/ci.yml`) roda lint e build em toda PR
