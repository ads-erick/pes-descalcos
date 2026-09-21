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

Não existe uma tabela de "times": os lados de cada fut são só `branco`/`preto`, escolhidos a cada partida. A "seleção do fut" é calculada dinamicamente a partir das stats em `participacao` (gols + assistências); só as vagas que o admin troca na mão ficam guardadas, em `selecao_escolha`.

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
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → `service_role` (ou "secret"). Só no servidor: é o que sobe e apaga as fotos das cartinhas |
| `DATABASE_URL` | Supabase → Connect → Connection String (URI), sempre a do **pooler** (a conexão direta é só IPv6 e a Vercel não alcança). Caracteres especiais da senha precisam ser codificados (`@` → `%40`) |
| `ADMIN_PASSWORD` | Senha de quem lança os dados, escolhida por vocês |
| `ADMIN_SESSION_SECRET` | Qualquer valor aleatório: `openssl rand -base64 32` |

### Deploy na Vercel

Importar o repositório na Vercel e cadastrar as mesmas variáveis de ambiente acima (a
`SUPABASE_SERVICE_ROLE_KEY` precisa ir junto, senão as fotos não sobem).

A `DATABASE_URL` tem que ser a do pooler do Supabase, em qualquer uma das duas portas:

- **6543** (modo transação) — a recomendada pra serverless: o pooler não guarda prepared
  statements, e `src/data/db.ts` desliga eles sozinho ao ver essa porta.
- **5432** (modo sessão) — também funciona.

Cada instância serverless abre o próprio pool (no máximo 5 conexões, devolvidas depois de
20s paradas), pra não estourar o limite de conexões do Supabase com o site no ar.

### Banco de dados

As migrações ficam em `supabase/migrations/` e são aplicadas em ordem:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f supabase/migrations/0001_init.sql
```

(Repetir pra cada arquivo novo em `supabase/migrations/`, na ordem.)

As tabelas têm RLS ativado sem policies: a chave publishable do Supabase não lê nem escreve nada. Todo acesso passa pelo servidor do Next.js (`src/data/`), usando a `DATABASE_URL`.

### Fotos das cartinhas

Ficam no bucket público `fotos` do Supabase Storage (criado pela migração `0004_bucket_fotos.sql`), em `jogadores/<id>/<timestamp>.jpg`; a URL pública vai na coluna `jogador.foto_url`. Qualquer um lê pela URL, mas só o servidor sobe e apaga, com a `SUPABASE_SERVICE_ROLE_KEY` (`src/data/fotos.ts`).

O navegador recorta a foto num quadrado e reduz pra 400×400 JPEG (~30 KB) antes de enviar (`src/lib/foto.ts`), então foto de celular de vários MB passa no limite de 1 MB das Server Actions. Trocar ou remover a foto apaga a anterior do bucket, e excluir o jogador também; jogador arquivado mantém a foto.

## Estrutura

- `src/app/` — rotas e Server Actions
- `src/data/` — camada de acesso a dados (só roda no servidor): queries, autenticação de admin
- `src/components/` — componentes visuais (ex: cartinha do jogador)
- `src/lib/` — constantes e helpers compartilhados entre servidor e cliente (`estilo.ts` tem as classes de botão, campo e painel)
- `public/marca/escudo.png` — o escudo do time sem fundo, usado como máscara (pega a cor do tema)
- `public/texturas/` — as estampas das camisas usadas de fundo

## Identidade visual

Tirada das camisas do grupo. Os temas seguem o sistema do aparelho até a pessoa escolher no botão do cabeçalho; a escolha fica no cookie `tema`.

- **Escuro (camisa preta):** fundo preto com rosas vinho, detalhes dourados
- **Claro (camisa branca):** fundo com mármore cinza, detalhes em azul-marinho

As cores são tokens em `src/app/globals.css` (`bg-fundo`, `text-tinta`, `text-apagado`, `border-linha`, `bg-destaque`, `text-dourado`...), redefinidos por tema. Use os tokens em vez de cores fixas, assim o componente já funciona nos dois temas. Fontes: Alfa Slab One (títulos, como no escudo), Bebas Neue (números e rótulos), Barlow (texto) e Caveat Brush (detalhes).

A cartinha (`src/components/jogador-card.tsx`) segue o modelo FUT: moldura de ouro, prata ou bronze pelo nível, e todas as medidas em `cqw` pra escalar com a largura da carta.

### Dados de teste

Pra ver o layout com o elenco cheio:

```bash
npm run seed:teste    # cria 20 jogadores e 10 futs de teste (rodar de novo recria igual)
npm run seed:limpar   # apaga só os dados de teste
```

Tudo que o seed cria tem id começando com `5eed`, então a limpeza não encosta nos dados reais.

## Nível das cartinhas e seleção do fut

Os critérios ficam em `src/lib/nivel.ts`.

**Nível (60 a 95):** o admin escolhe o nível de cada jogador no cadastro (bronze 60–69, prata 70–79, ouro 80–95), e os futs sobem ou descem **até 10 pontos** a partir dele. A carta mostra o nível atual e a variação (▲/▼).

Cada fut dá uma nota ao jogador:

- **Gols e assistências** somam pontos
- **Defesa**: metade do saldo do time no fut (quanto sofreu a menos ou a mais que a média do jogo)
- **Peso por posição**: goleiro e zagueiro têm peso alto na defesa e normal em gols/assistências; meia e atacante, o contrário. Sem posição, tudo normal

A nota média por fut do jogador é comparada com a média do grupo dele (goleiros + zagueiros, meias + atacantes; quem não tem posição é comparado com todo mundo): acima da média sobe, abaixo desce. Com poucos jogos a variação é menor (1 fut conta 25%, 3 futs 50%), pra um jogo isolado não mexer demais na carta.

A **seleção do fut** usa a mesma nota, só que daquele fut: os 5 melhores (com nota positiva), e o primeiro é o craque.

## Sorteio de times

Critérios em `src/lib/sorteio.ts`. A força de cada time é a soma dos níveis das cartinhas. O sorteio:

1. Divide cada posição entre os dois lados, intercalando: um goleiro pra cada time, zagueiros divididos, e assim por diante. Quem não tem posição completa os times. Os times ficam do mesmo tamanho (ou com um a mais, se o número for ímpar)
2. Troca jogadores da mesma posição entre os times enquanto isso aproximar a força dos dois
3. Repete isso 200 vezes com ordens aleatórias e escolhe ao acaso uma das divisões com diferença de até 2 pontos a mais que a melhor, pra "sortear de novo" trazer times diferentes

Tudo roda no navegador, nada é salvo. O admin pode levar os times sorteados pro registro do fut (`/futs/novo?branco=…&preto=…`).

## Admin

A lista de jogadores é pública. Para cadastrar, entre em `/admin/login` com a `ADMIN_PASSWORD`. A sessão fica num cookie assinado por 30 dias.

## Workflow de contribuição

Projeto pessoal, mas seguindo boas práticas:

- `main` sempre estável e protegida — nada é commitado direto nela
- Uma branch por mudança, prefixada por tipo: `feat/`, `fix/`, `chore/`, `docs/`
- Commits seguindo [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`...)
- Toda mudança vira Pull Request para `main`, revisado e aprovado manualmente antes do merge
- CI (`.github/workflows/ci.yml`) roda lint e build em toda PR
- Toda PR atualiza o [`ROADMAP.md`](ROADMAP.md), marcando o que foi entregue e se já foi testado
