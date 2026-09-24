# Roadmap

O que está sendo feito, o que vem a seguir e o que já está no ar. Toda PR atualiza este arquivo.

**Legenda:** `[x]` pronto e testado · `[~]` pronto, mas falta testar ou mergear · `[ ]` a fazer

Site: https://pes-descalcos.vercel.app (publica sozinho a cada merge na `main`)

## Próximos passos

Pedidos da galera, na ordem em que devem sair:

- [ ] **Tema claro mais fiel à camisa branca** — os rastros da estampa no fundo do tema claro (`public/texturas/marmore.svg`) não estão 100% iguais aos da camisa. **Depende do Erick mandar uma foto da camisa em qualidade melhor** pra redesenhar a estampa a partir dela. O tema escuro (`rosas.svg`) não entra.
- [ ] **Tela de replays** — uma tela pra ver os replays dos futs. **Falta decidir de onde vêm os vídeos:** link por fut (YouTube, Drive...) cadastrado pelo admin é o mais simples e não gasta armazenamento; subir o vídeo pro Supabase Storage estoura o plano grátis rápido. Provável formato: um campo de link (ou vários) no registro do fut, o player na página do fut e uma página "Replays" listando os futs que têm vídeo.

## Mais pra frente

Sem ordem fechada, mais ou menos do mais útil pro mais enfeite:

- [ ] **Foto em outras telas** — a foto já aparece nas cartinhas (elenco e seleção); falta levar pro sorteio, estatísticas e destaques do fut.
- [ ] **Estatísticas de temporadas passadas** — escolher um ano específico (hoje é só mês e ano atuais ou tudo).
- [ ] **Página do jogador** — hoje a carta só abre a edição (pro admin). Uma página com os números da carreira, os futs que jogou e o gráfico do nível fut a fut.
- [ ] **Conquistas** — artilheiro do mês, sequência de presença, etc.
- [ ] **Time do ano** — a seleção do campo, mas com o ano inteiro. Fazer perto do fim do ano, reusando `escalarSelecao`.
- [ ] **Votação de MVP** — a galera vota no melhor de cada fut. Precisa de login por jogador.
- [ ] **Confirmação de presença** — a galera marca que vai no fut e o sorteio já abre com essa lista (hoje quem marca é quem está sorteando). Precisa de login por jogador.

## Segurança

Revisão de 22/09/2026. O que já está ok:

- [x] **Segredos longe do navegador** — `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` e `CRON_SECRET` só aparecem em código de servidor (`src/data/*` tem `server-only`, que quebra o build se um componente de navegador importar). Conferido também no resultado: build com segredos falsos e busca por eles nos arquivos que vão pro navegador, nada encontrado. Vão pro navegador só a URL do Supabase e a chave do site do Turnstile, que são públicas mesmo.
- [x] **SQL injection** — toda consulta passa pelo `` sql`...` `` da lib `postgres`, que manda os valores separados da consulta (nunca concatena texto). Os `sql({...})` de insert/update só usam colunas fixas do código, e tudo que vem de formulário passa pelo `zod` antes. Não tem `sql.unsafe` em lugar nenhum. (Prompt injection não se aplica: o site não usa IA.)
- [x] **Escrita só pro admin** — toda função que grava no banco chama `requireAdmin()` na camada de dados, então chamar a server action direto sem o cookie não adianta.
- [x] **Banco fechado pra API pública do Supabase** — RLS ligado em todas as tabelas, sem policies: a chave pública não lê nem grava nada.
- [x] **Supabase acordado** — cron diário em `/api/manter-ativo`, protegido pela `CRON_SECRET` (#31).
- [x] **Limite de tentativas no login** — 5 senhas erradas em 15 min bloqueiam aquele IP até a mais antiga sair da janela, com o aviso de quantos minutos faltam. As tentativas ficam na tabela `login_tentativa` (a memória da instância não serve na Vercel), só com um HMAC do IP; IPv6 conta pela rede /64, que é o bloco de uma casa. Tentativas em paralelo não furam a contagem (lock por IP no banco), e a senha certa zera o contador. As outras server actions não precisam: sem o cookie de admin elas não fazem nada (#37).
- [x] **Captcha no login (Cloudflare Turnstile)**: grátis e quase sempre sem clicar em nada. O servidor confere o token na Cloudflare antes de olhar a senha, então sem passar pelo captcha a tentativa nem conta pro limite; se a Cloudflare não responder, recusa. Cada token vale uma vez: depois de uma senha errada o widget gera outro sozinho. Só liga com `TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY` configuradas (#38).
- [x] **Cabeçalhos de segurança**: todas as páginas mandam `frame-ancestors 'none'` + `X-Frame-Options: DENY` (outro site não embute o nosso num iframe pra enganar o admin), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` sem câmera/microfone/localização e uma CSP parcial (`base-uri`, `form-action`, `object-src`). Não é CSP completa: bloquear scripts exigiria nonce e deixaria todas as páginas dinâmicas. O HSTS a Vercel já manda; o `X-Powered-By` saiu (#39).
- [x] **Dependabot e secret scanning**: o GitHub avisa quando sai falha de segurança numa dependência (npm e Actions) e abre PR com a correção sozinho. Só correção de segurança, não toda versão nova. Também ligados o secret scanning e o push protection: um `git push` com senha ou chave no código é barrado (#39).

## Pendências técnicas

- [ ] Senha de admin única para todos os admins; se entrarem mais pessoas, trocar por login individual.
- [ ] A senha de admin e o segredo da sessão na produção são os mesmos do desenvolvimento. Não vazaram (o `.env.local` nunca foi pro git, conferido no histórico), mas o ideal é produção ter os próprios: trocar na Vercel e dar Redeploy quando der.
- [ ] Jogador arquivado não tem tela pra voltar ao elenco; por enquanto é `update jogador set ativo = true` no banco.
- [ ] Sem testes automatizados: os fluxos são verificados a cada PR por um script de navegador contra o banco, mas o script é descartável e não está versionado.
- [ ] Os números do nível (quanto cada fut mexe, a curva que deixa subir mais difícil lá em cima) foram calibrados com dados de teste; revisar quando tiver uns 10 futs reais.

## Feito

Resumo do que está no ar, agrupado por tela. O detalhe de cada mudança está na PR indicada.

### Elenco e jogadores

- [x] **Cadastro, edição e exclusão** — formulário com validação e prévia da cartinha ao lado enquanto se digita. Jogador que já jogou é arquivado em vez de apagado, pra não sumir do histórico (#2, #5, #13)
- [x] **Cartinhas no modelo FUT** — bronze, prata e ouro pelo nível, escudo do clube, foto num medalhão redondo com a cor da raridade. Pro admin, clicar na carta abre a edição. Botão direito (ou toque longo no celular) copia ou baixa a carta em PNG — na carta do craque da seleção, a tarja sai junto (#11, #13, #20, #22, #24, #34)
- [x] **Foto do jogador** — escolhida no cadastro ou na edição, com enquadramento (arrastar, pinça, roda do mouse). O navegador recorta e reduz antes de enviar; fica no Supabase Storage e sai do bucket quando é trocada ou o jogador excluído (#10, #22)
- [x] **Foto pelo círculo do avatar** — no cadastro e na edição, além do botão "Trocar", o próprio círculo da foto abre a escolha do arquivo, que cai direto no enquadramento. Um "trocar foto" aparece por cima no hover e ao tocar, e um selo de câmera fica sempre no canto (no celular não tem hover pra avisar). O teclado continua indo pelo botão (#42)
- [x] **Filtros no elenco** — busca por nome, apelido ou camisa (sem ligar pra acento) e filtro por posição (#19)
- [x] **Nível** — de 70 a 95 (bronze 70–75, prata 76–79, ouro 80–95), escolhido pelo admin e sempre respeitado. Cada fut registrado depois mexe no máximo 2 pontos, comparando o jogador com a média do seu grupo (defesa ou ataque) naquele fut; subir fica mais difícil quanto mais alto. A carta mostra ▲/▼ com a variação. Critérios em `src/lib/nivel.ts` (#6, #7, #23, #25)

### Futs

- [x] **Registro do fut** — data, placar, escalação branco/preto, gols e assistências por jogador; editar e excluir (#3, #5)
- [x] **Registro do fut no visual do detalhe** — placar de estádio com as cores das camisas e as tabelas "Time branco" e "Time preto" lado a lado. O jogador entra direto na tabela do time pelo "+ Adicionar" (com busca por nome ou número; Enter escala o primeiro da lista sem mandar o fut), gols e assistências vão nos botões − e +, e clicar no nome abre "Passar pro outro time" e "Tirar do fut". O placar vai somando os gols lançados; mexido na mão (gol contra, gol de quem não é do elenco) fica fixo, com um "Voltar a somar" se não bater. Vale pro registro, pra edição e pro fut aberto pelo sorteio. Testado de 320px ao desktop (#45)
- [x] **Lista e detalhe** — a lista mostra o vencedor e o craque; o detalhe mostra placar, escalação e os destaques do fut (#6, #15)

### Seleção

- [x] **Seleção do fut no campo** — campo de fut7 com 1 goleiro, 2 zagueiros, 2 meias e 2 atacantes, pelos números do fut (gols + assistências, desempate por gols e pelo placar do time). Cartas pretas no estilo inform, prévia grande da carta no desktop. Vaga sem gente da posição vai pro melhor que sobrou ("improvisado") (#12, #16, #18, #26, #27)
- [x] **Tarja do craque na prévia** — a carta grande que aparece ao passar o mouse no campo (desktop) também leva a tarja "Craque", do tamanho proporcional ao da carta, igual no campo (#36)
- [x] **Troca na mão** — o admin clica numa vaga e escolhe qualquer um que jogou o fut, ou volta pra escolha automática. Fica na tabela `selecao_escolha` (#26, #27, #30)
- [x] **Craque escolhido na mão** — o admin clica com o botão direito numa carta do campo (ou toque longo no celular) e escolhe "Tornar craque", ou "Voltar pro craque automático" na carta do escolhido. Vale qualquer um da seleção, mesmo sem gol nem assistência; se ele sair da seleção, o craque volta pra conta. Lista de futs, detalhe do fut, estatísticas e seleção mostram o mesmo craque. Sem escolha, o craque passa a ser o de melhores números entre os escalados (antes era o do fut inteiro, mesmo que tivesse sido trocado pra fora da seleção). Fica em `fut.craque_id` (#41)

### Estatísticas e sorteio

- [x] **Estatísticas** — gols, assistências, vitórias (com aproveitamento), seleções e craques, nessa ordem, filtrando por mês, ano ou desde sempre. Empate divide a colocação. Cada tabela tem uma frase explicando o que conta (#8, #17, #43)
- [x] **Mais vezes na seleção** — tabela "Seleções": quantas vezes cada um entrou na seleção do fut (os 7 do campo), contando as trocas que o admin fez na mão, igual aparece na tela da seleção. Com 5 tabelas, a tela passou a mostrar 3 em cima e 2 embaixo (5 lado a lado ficava apertado demais) (#43)
- [x] **Rankings viraram Estatísticas** — a aba e a página mudaram de nome e o endereço agora é `/estatisticas`; link antigo pra `/rankings` redireciona sozinho. No celular estreito (abaixo de 360px) a fonte do menu encolhe um pouco pro nome maior caber sem rolar (#43)
- [x] **Sorteio sem a diferença de força** — cada time continua mostrando a própria força e a média; o que saiu foi a linha comparando os dois (#34)
- [x] **Sorteio de times balanceados** — marca quem vai jogar e o sorteio divide branco x preto com a soma dos níveis mais parecida possível, uma posição de cada vez. O admin abre o registro do fut já com a escalação sorteada. Critérios em `src/lib/sorteio.ts` (#9)

### Visual e celular

- [x] **Fundo igual em todas as telas** — a estampa era medida pela janela e dava um zoom quando a barra de rolagem aparecia ou a barra de endereço do celular sumia; agora vai por `vw`/`lvh`, que não mudam nessas horas (#34)
- [x] **Menu parado no lugar** — o menu andava uns 7px pro lado nas páginas curtas (como a lista de futs), que não tinham barra de rolagem e por isso ficavam mais largas. Agora a barra aparece sempre, vazia quando não tem o que rolar, e o menu fica na mesma posição em todas as telas. O bloco Admin/Sair não influenciava. No celular a barra não ocupa espaço, então nada muda lá (#40)
- [x] **Identidade visual** — tema claro (camisa branca) e escuro (camisa preta), seguindo o sistema ou escolhido no cabeçalho; escudo, fontes retrô e um sistema único de botões com foco de teclado (#11, #13, #14)
- [x] **Celular** — testado de 320px a 430px sem rolagem lateral: cabeçalho que encolhe, alvos de toque maiores, campos que não dão zoom no iPhone, carta pequena legível no campo. Cabeçalho testado de 300 a 1600px sem nada se sobrepondo (#20, #27, #29)

### Infra e projeto

- [x] **Base** — Next.js + TypeScript + Tailwind, Postgres no Supabase com RLS, CI com lint e build em toda PR (#1, #2)
- [x] **Área de admin** — login por senha única, sessão em cookie assinado; depois do login volta pra página onde estava. 5 senhas erradas bloqueiam o IP por até 15 min, e tem captcha da Cloudflare (#2, #27, #37, #38)
- [x] **No ar na Vercel** — conexão com o banco ajustada pra serverless (pooler em modo transação, conexões liberadas depois de 20s paradas), validação geral de todas as telas antes do deploy e elenco de verdade cadastrado (#21, #28)
- [x] **Supabase sempre acordado + backup diário** — o plano grátis pausa o projeto depois de uma semana sem uso: um cron da Vercel chama `/api/manter-ativo` todo dia e faz uma consulta no banco. Às 6h o GitHub Actions guarda um backup do banco e das fotos, criptografado com AES-256 porque o repositório é público, e fica 30 dias nos artifacts. Restauração testada (#31, #33)
- [x] **Dados de teste** — `npm run seed:teste` cria jogadores e futs de mentira, `npm run seed:limpar` apaga (#6)
- [x] **README** — prints das telas e o fluxo de trabalho feito com o Claude Code (#29)
