# Roadmap

O que já foi feito, o que vem a seguir e o que está só no radar. Toda PR atualiza este arquivo.

**Legenda:** `[x]` pronto e testado · `[~]` pronto, mas falta testar · `[ ]` a fazer

## Feito

- [x] **Base do projeto** — Next.js + TypeScript + Tailwind, CI com lint e build em toda PR (#1)
- [x] **Banco de dados** — tabelas `jogador`, `fut` e `participacao`, RLS ativado (#1, #2)
- [x] **Cadastro de jogadores** — lista pública em cartinhas, formulário com validação (#2)
- [x] **Área de admin** — login por senha única, sessão em cookie assinado, cadastro bloqueado sem sessão (#2)
- [x] **Registro do fut** — data, placar, escalação branco/preto, gols e assistências por jogador; estatísticas refletidas nas cartinhas (#3)
- [x] **Editar e excluir jogadores e futs** — link "Editar" nas listas (só pra admin), mesmo formulário do cadastro já preenchido, botão excluir com confirmação. Jogador que já jogou algum fut é arquivado em vez de apagado, pra não sumir do histórico (#5)
- [x] **Detalhe do fut + seleção do fut** — página de cada partida (clicando no fut da lista) com placar, escalação branco/preto e a seleção do fut: top 5 pela nota do fut, com o craque em destaque. O "destaque" da lista virou o craque, pela mesma regra (#6)
- [x] **Nível das cartinhas** — nível de 60 a 95 no canto da carta (bronze 60–69, prata 70–79, ouro 80–95), calculado com peso por posição: goleiro e zagueiro pesam mais pelos gols sofridos, meia e atacante pelos gols e assistências. Gols e assistências nunca tiram nível. Critérios em `src/lib/nivel.ts`; elenco ordenado por nível (#6)
- [x] **Dados de teste** — `npm run seed:teste` cria 20 jogadores e 10 futs pra testar o layout, `npm run seed:limpar` apaga (#6)
- [x] **Nível escolhido no cadastro** — o admin define o nível de cada jogador (60–95) no formulário e os futs mexem até 10 pontos pra cima ou pra baixo, comparando a nota média por fut com a média do grupo (defesa: goleiro + zagueiro; ataque: meia + atacante). A carta mostra ▲/▼ com a variação (#7)
- [x] **Rankings** — página nova no menu com artilharia, assistências e presença (com % dos futs), filtrando por este mês, este ano ou desde sempre. Empate divide a colocação e jogador arquivado continua contando nos períodos em que jogou (#8)
- [x] **Sorteio de times balanceados** — página "Sorteio" no menu (aberta pra todo mundo): marca quem vai jogar e o sorteio divide branco x preto com a soma dos níveis mais parecida possível, dividindo cada posição entre os dois lados (um goleiro pra cada time, zagueiros divididos...). "Sortear de novo" traz outra divisão equilibrada. O admin tem um botão que abre o registro do fut já com a escalação sorteada. O cabeçalho no celular também foi arrumado: os links descem pra uma segunda linha em vez de estourar a tela. Critérios em `src/lib/sorteio.ts`

## Próximos passos

Em ordem de prioridade:

1. [ ] **Foto na cartinha** — upload pelo Supabase Storage (precisa da `SUPABASE_SERVICE_ROLE_KEY`).
2. [ ] **Capricho visual** — identidade própria pro site e uma cartinha à altura, depois que as telas principais estiverem estáveis.
3. [ ] **Deploy na Vercel** — publicar o site pra galera acessar quando estiver com cara de pronto. A `DATABASE_URL` precisa ser a do pooler (a conexão direta do Supabase é só IPv6 e a Vercel não alcança).

## Mais pra frente

- [ ] **Time do ano** — fechamento da temporada. Fazer perto do fim do ano.
- [ ] **Votação de MVP** — a galera vota no melhor de cada fut.
- [ ] **Confirmação de presença** — a galera marca que vai no fut e o sorteio já abre com essa lista (hoje quem marca é quem está sorteando). Precisa de algum login por jogador.
- [ ] **Conquistas** — artilheiro do mês, sequência de presença, etc.
- [ ] **Evolução do jogador** — gráfico fut a fut.
- [ ] **Rankings de temporadas passadas** — escolher um ano específico (hoje é só mês e ano atuais ou tudo).

## Pendências técnicas

- [ ] Senha de admin única para todos os admins; se entrarem mais pessoas, trocar por login individual.
- [ ] Jogador arquivado não tem tela pra voltar ao elenco; por enquanto é `update jogador set ativo = true` no banco.
- [ ] Sem testes automatizados: os fluxos são verificados por script contra o banco a cada PR, mas o script não está versionado.
- [ ] Os números do nível (5 de nível por ponto acima da média, variação máxima de 10, 3 jogos pra "confiar") foram calibrados com os dados de teste; revisar quando tiver uns 10 futs reais.
