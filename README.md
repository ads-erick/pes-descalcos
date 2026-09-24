<div align="center">

<img src="public/marca/escudo.png" alt="Escudo do Pés Descalços FC" width="96" />

# Pés Descalços FC

**Cartinhas, estatísticas e seleção do fut da galera.**

[pes-descalcos.vercel.app](https://pes-descalcos.vercel.app) · Next.js 16 · Supabase · Vercel

</div>

![Elenco nos dois temas: camisa preta à esquerda, camisa branca à direita](docs/prints/elenco-temas.jpg)

Um site de brincadeira pro nosso grupo de futebol: cada jogador vira uma cartinha no estilo FUT, cada fut fica registrado com placar, gols e assistências, e o site monta sozinho a seleção da rodada, as estatísticas da temporada e até sorteia times equilibrados.

## O que tem

### Seleção do fut

Os melhores de cada fut num campo de fut7 (1 goleiro, 2 zagueiros, 2 meias, 2 atacantes), em cartas pretas no estilo das cartas inform do FIFA. A escolha é pelos números do fut (gols + assistências), e o craque ganha a tarja dourada (o admin pode escolher outro). Passando o mouse numa carta do campo, ela aparece grande do lado.

![Seleção do fut no campo](docs/prints/selecao.jpg)

### No celular

Tudo foi pensado pro celular primeiro, que é onde a galera abre o site: cabeçalho que cabe em 320px, toque longo na carta pra copiar ou baixar como imagem, campos que não dão zoom no iPhone.

![Elenco, seleção e futs no celular](docs/prints/celular.png)

### Futs

Cada fut tem placar, resultado e os destaques da partida.

![Detalhe do fut com placar e destaques](docs/prints/fut.jpg)

### Estatísticas

Quem mais fez gols, deu assistências, venceu, entrou na seleção do fut e foi craque, com uma frase explicando cada tabela. Dá pra ver do mês, do ano ou desde sempre, e empate divide a colocação.

![Estatísticas de gols, assistências, vitórias, seleções e craques](docs/prints/estatisticas.jpg)

### Sorteio de times

Marca quem vai jogar e o sorteio divide branco x preto com a soma dos níveis mais parecida possível, dividindo cada posição entre os dois lados. "Sortear de novo" traz outra divisão também equilibrada.

![Sorteio de times balanceados](docs/prints/sorteio.jpg)

### Área do admin

Só quem tem a senha lança os dados. O admin cadastra jogadores (com foto enquadrada na hora e a cartinha atualizando ao lado), registra os futs e pode trocar na mão qualquer vaga da seleção.

| Cadastro do jogador | Troca de vaga na seleção |
|---|---|
| ![Formulário de jogador com prévia da cartinha](docs/prints/admin-jogador.jpg) | ![Janela de troca de jogador numa vaga da seleção](docs/prints/admin-troca.jpg) |

## Como foi feito

O projeto saiu em uma semana (de 14 a 21 de setembro de 2026), com quase 30 pull requests e mais de 70 commits, sempre neste ritmo:

```mermaid
flowchart LR
    A["Eu peço<br/>(em português, do jeito que falo)"] --> B["Claude Code<br/>lê o código e reproduz"]
    B --> C["Implementa numa<br/>branch nova"]
    C --> D["Testa: lint, build e<br/>navegador de verdade"]
    D --> E["Abre o PR<br/>e atualiza o roadmap"]
    E --> F["Eu testo no celular,<br/>reviso e faço o merge"]
    F --> G["Vercel publica"]
    F -. "achei um bug" .-> A
```

**1. O pedido.** Eu escrevo o que quero do jeito que falaria com um amigo, muitas vezes testando no celular: *"no mobile tá cortando o placar"*, *"a seleção devia ser pelos gols e assistências"*, *"sobe o localhost e o IP pro celular"*.

**2. Entender e reproduzir.** Antes de mexer em qualquer coisa, o Claude Code lê o código envolvido e a documentação da versão do Next.js que está instalada (o [`AGENTS.md`](AGENTS.md) pede isso, porque o Next 16 mudou bastante). Bug relatado é reproduzido primeiro: ele abre o site num Chrome headless com a tela do tamanho de um celular, mede os elementos e tira print do antes. Quando um bug não aparecia no teste, ele foi atrás no log do servidor. Foi assim que descobriu que o botão "Admin" continuava aparecendo depois do login só em abas que já estavam abertas antes.

**3. Implementar.** Cada mudança numa branch própria (`feat/`, `fix/`, `docs/`), com commits no padrão [Conventional Commits](https://www.conventionalcommits.org/) e comentários no código explicando o *porquê* das decisões menos óbvias.

**4. Testar de verdade.** Lint, TypeScript e build passando não bastam: ele roda um script de navegador contra o site, tira print do depois e testa os fluxos de admin de ponta a ponta, com um cookie de sessão assinado no próprio teste. Os dados de teste têm um prefixo próprio e são apagados no final.

**5. Abrir o PR.** Ele abre o pull request pelo `gh` com a descrição no [template do projeto](.github/pull_request_template.md) (o que muda, como testar, checklist) e atualiza o [`ROADMAP.md`](ROADMAP.md), com uma regra de honestidade: `[x]` só pro que foi testado, `[~]` pro que está pronto mas ainda não foi testado.

**6. Revisar e aprovar.** Eu testo no celular (o Claude Code sobe o servidor de desenvolvimento e me passa o IP da rede), reviso e faço o merge. O merge é sempre meu, nunca dele. Se encontro algum problema, volto pro passo 1 na mesma branch. O CI roda lint e build em todo PR, e a Vercel publica a cada merge na `main`.

Entre uma conversa e outra, o Claude Code guarda notas sobre como eu gosto de trabalhar (quem abre e quem faz merge dos PRs, como testar, as armadilhas que já apareceram). Assim cada sessão continua de onde a outra parou.

Antes de subir pra Vercel, também pedi uma revisão de segurança: segredos no histórico do git, `requireAdmin()` em toda escrita, RLS no banco, validação do upload, redirecionamento aberto e `npm audit`.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) + TypeScript + Tailwind CSS v4
- Postgres no [Supabase](https://supabase.com), acessado direto pelo servidor com [`postgres`](https://github.com/porsager/postgres); fotos no Supabase Storage
- Deploy na [Vercel](https://vercel.com), CI no GitHub Actions (lint + build)

## Modelo de dados

Cinco tabelas (ver `supabase/migrations/`):

- **jogador** — cadastro (nome, apelido, número, foto, posição, nível escolhido, se está ativo no grupo)
- **fut** — cada partida (data, placar time branco x time preto e, se o admin escolheu, o craque)
- **participacao** — números de um jogador num fut (de que lado jogou, gols, assistências)
- **selecao_escolha** — as vagas da seleção que o admin trocou na mão
- **login_tentativa** — tentativas de login do admin (só um hash do IP), pro bloqueio depois de 5 senhas erradas em 15 min

Não existe tabela de "times": os lados de cada fut são só `branco`/`preto`, escolhidos a cada partida. A seleção do fut é calculada na hora a partir de `participacao`; só as trocas manuais (e o craque escolhido na mão) ficam guardadas.

## Nível das cartinhas

Os critérios ficam em `src/lib/nivel.ts`.

**Nível (70 a 95):** o admin escolhe o nível de cada jogador no cadastro (bronze até 75, prata até 79, ouro a partir de 80), e cada fut jogado depois disso mexe um pouquinho nele. A carta mostra o nível atual e a variação (▲/▼).

Cada fut dá uma nota ao jogador:

- **Gols e assistências** somam pontos
- **Defesa**: metade do saldo do time no fut
- **Peso por posição**: goleiro e zagueiro têm peso alto na defesa; meia e atacante, em gols e assistências

A nota é comparada com a média do grupo dele naquele fut (goleiros + zagueiros, meias + atacantes): acima da média sobe, abaixo desce. Cada fut derruba no máximo 2 pontos e sobe no máximo 2. Subir fica mais difícil quanto mais alto o nível: o ganho máximo cai pela metade a cada 8 níveis. Quando o admin muda o nível na mão, só os futs cadastrados depois disso passam a contar.

## Seleção do fut

Critérios em `src/lib/selecao.ts`. A nota da seleção é **gols + assistências**, sem o saldo do time (senão quem fez 1 gol no time que ganhou de lavada passaria na frente de quem fez 2G/1A no que perdeu). Desempate: mais gols, depois o time que foi melhor no placar (é o que separa goleiros e zagueiros), depois ordem alfabética.

As vagas são preenchidas pelos melhores de cada posição. Se faltar gente numa posição, a vaga vai pro melhor que sobrou e aparece como "improvisado". O craque do fut é o de melhores números entre os escalados (se alguém pontuou). O admin pode trocar: botão direito (ou toque longo no celular) numa carta do campo e "Tornar craque", que vale pra qualquer um da seleção. Se o escolhido sair da seleção, o craque volta pra conta.

## Sorteio de times

Critérios em `src/lib/sorteio.ts`. A força de cada time é a soma dos níveis das cartinhas. O sorteio:

1. Divide cada posição entre os dois lados, intercalando: um goleiro pra cada time, zagueiros divididos, e assim por diante. Quem não tem posição completa os times
2. Troca jogadores da mesma posição entre os times enquanto isso aproximar a força dos dois
3. Repete isso 200 vezes com ordens aleatórias e escolhe ao acaso uma das divisões com diferença de até 2 pontos a mais que a melhor, pra "sortear de novo" trazer times diferentes

Tudo roda no navegador, nada é salvo. O admin pode levar os times sorteados pro registro do fut.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencher as variáveis (ver abaixo)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Pra testar no celular na mesma rede, `npm run dev -- -H 0.0.0.0` e abra pelo IP do computador (`next.config.ts` já libera `192.168.*.*` e `10.*.*.*`).

### Variáveis de ambiente

| Variável | Onde pegar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Connect |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → `service_role` (ou "secret"). Só no servidor: é o que sobe e apaga as fotos das cartinhas |
| `DATABASE_URL` | Supabase → Connect → Connection String (URI), sempre a do **pooler** (a conexão direta é só IPv6 e a Vercel não alcança). Caracteres especiais da senha precisam ser codificados (`@` → `%40`) |
| `ADMIN_PASSWORD` | Senha de quem lança os dados, escolhida por vocês |
| `ADMIN_SESSION_SECRET` | Qualquer valor aleatório: `openssl rand -base64 32` |
| `CRON_SECRET` | Só na Vercel. Qualquer valor aleatório: `openssl rand -base64 32`. Protege a rota do cron que mantém o Supabase acordado |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare → Turnstile → Add widget (domínio do site na Vercel, modo Managed). Opcionais: sem as duas, o login fica sem captcha. Pra testar local tem as chaves de teste no `.env.example` |

### Banco de dados

As migrações ficam em `supabase/migrations/` e são aplicadas em ordem:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f supabase/migrations/0001_init.sql
```

(Repetir pra cada arquivo novo em `supabase/migrations/`, na ordem.)

As tabelas têm RLS ativado sem policies: a chave publishable do Supabase não lê nem escreve nada. Todo acesso passa pelo servidor do Next.js (`src/data/`), usando a `DATABASE_URL`, e toda escrita chama `requireAdmin()`.

### Dados de teste

Pra ver o layout com o elenco cheio:

```bash
npm run seed:teste    # cria 20 jogadores e 10 futs de teste (rodar de novo recria igual)
npm run seed:limpar   # apaga só os dados de teste
```

Tudo que o seed cria tem id começando com `5eed`, então a limpeza não encosta nos dados reais.

### Deploy na Vercel

Importar o repositório na Vercel e cadastrar as mesmas variáveis de ambiente acima (a `SUPABASE_SERVICE_ROLE_KEY` precisa ir junto, senão as fotos não sobem).

A `DATABASE_URL` tem que ser a do pooler do Supabase, em qualquer uma das duas portas:

- **6543** (modo transação) — a recomendada pra serverless: o pooler não guarda prepared statements, e `src/data/db.ts` desliga eles sozinho ao ver essa porta.
- **5432** (modo sessão) — também funciona.

Cada instância serverless abre o próprio pool (no máximo 5 conexões, devolvidas depois de 20s paradas), pra não estourar o limite de conexões do Supabase com o site no ar.

## Detalhes

### Backup e Supabase acordado

O plano grátis do Supabase não faz backup e pausa o projeto depois de 7 dias sem uso. Duas coisas cobrem isso, ambas grátis:

- **Cron da Vercel** (`vercel.json`): todo dia chama `/api/manter-ativo`, que faz um `select 1` no banco. A rota só responde a quem manda a `CRON_SECRET`, que a Vercel envia sozinha.
- **Backup diário** (`.github/workflows/backup.yml`, 06:00 de Brasília): roda `scripts/backup.sh`, que junta o dump do schema `public` e as fotos das cartinhas num `.tar.gz` criptografado com AES-256. O arquivo fica 30 dias nos artifacts da Action. Como o repositório é público, qualquer pessoa logada no GitHub consegue baixar o artifact, e por isso ele só sai criptografado.

Secrets do repositório (Settings → Secrets and variables → Actions):

| Secret | Valor |
|---|---|
| `DATABASE_URL` | A mesma da Vercel. Se for a porta 6543, o script troca sozinho pra 5432, porque o `pg_dump` precisa do modo sessão |
| `BACKUP_PASSPHRASE` | Senha longa (`openssl rand -base64 32`). **Guardar num gerenciador de senhas:** sem ela o backup não abre |

Pra rodar na hora: Actions → Backup → Run workflow.

Pra restaurar, baixar o artifact da execução escolhida e:

```bash
unzip backup-*.zip
gpg -d pes-descalcos-*.tar.gz.gpg | tar -xz        # pede a BACKUP_PASSPHRASE
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f pes-descalcos-*/banco.sql
```

O `banco.sql` apaga e recria as tabelas, então dá pra rodar por cima do banco atual. As fotos ficam em `fotos/jogadores/...`, com os mesmos caminhos do bucket. Num projeto Supabase novo, é preciso rodar antes a migração `0004_bucket_fotos.sql`, subir a pasta `jogadores` pro bucket `fotos` e trocar o domínio antigo em `jogador.foto_url`.


### Fotos das cartinhas

Ficam no bucket público `fotos` do Supabase Storage (migração `0004_bucket_fotos.sql`), em `jogadores/<id>/<timestamp>.jpg`; a URL pública vai na coluna `jogador.foto_url`. Qualquer um lê pela URL, mas só o servidor sobe e apaga, com a `SUPABASE_SERVICE_ROLE_KEY` (`src/data/fotos.ts`).

Ao escolher a foto, abre um enquadramento (arrastar, pinça ou roda do mouse), e o navegador recorta e reduz pra 400×400 JPEG (~30 KB) antes de enviar (`src/lib/foto.ts`), então foto de celular de vários MB passa no limite de 1 MB das Server Actions. Trocar ou remover a foto apaga a anterior do bucket, e excluir o jogador também; jogador arquivado mantém a foto.

### Identidade visual

Tirada das camisas do grupo. Os temas seguem o sistema do aparelho até a pessoa escolher no botão do cabeçalho; a escolha fica no cookie `tema`.

- **Escuro (camisa preta):** fundo preto com rosas vinho, detalhes dourados
- **Claro (camisa branca):** branco frio com a estampa de mármore líquido cinza-azulada, detalhes no azul do número e as três listras do ombro embaixo do cabeçalho. A estampa (`public/texturas/marmore.svg`) sai de `scripts/textura-marmore.py`, que gera o desenho a partir de ruído e vetoriza em curvas

As cores são tokens em `src/app/globals.css` (`bg-fundo`, `text-tinta`, `text-apagado`, `border-linha`, `bg-destaque`, `text-realce`...), redefinidos por tema. Fontes: Alfa Slab One (títulos, como no escudo), Bebas Neue (números e rótulos), Barlow (texto) e Caveat Brush (detalhes).

A cartinha (`src/components/jogador-card.tsx`) segue o modelo FUT: moldura de ouro, prata ou bronze pelo nível, e todas as medidas em `cqw` pra escalar com a largura da carta, do elenco no desktop ao campo no celular.

### Admin

Tudo é público pra ler. Pra lançar dados, entre em `/admin/login` com a `ADMIN_PASSWORD` (com as chaves do Turnstile configuradas, passa antes por um captcha da Cloudflare). A sessão fica num cookie assinado (HMAC), `httpOnly`, por 30 dias.

### Estrutura

- `src/app/` — rotas e Server Actions
- `src/data/` — acesso a dados (só roda no servidor): queries, fotos, autenticação de admin
- `src/components/` — componentes visuais (cartinha, campo, placar, menu)
- `src/lib/` — regras e helpers compartilhados entre servidor e cliente (nível, seleção, sorteio, ranking, `estilo.ts` com as classes de botão, campo e painel)
- `supabase/migrations/` — o esquema do banco, em ordem
- `scripts/` — backup, dados de teste e o gerador da estampa do tema claro
- `docs/prints/` — os prints deste README
