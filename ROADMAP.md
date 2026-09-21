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
- [x] **Rankings** — página nova no menu com gols, assistências e presença (com % dos futs), filtrando por este mês, este ano ou desde sempre. Empate divide a colocação e jogador arquivado continua contando nos períodos em que jogou (#8)
- [x] **Sorteio de times balanceados** — página "Sorteio" no menu (aberta pra todo mundo): marca quem vai jogar e o sorteio divide branco x preto com a soma dos níveis mais parecida possível, dividindo cada posição entre os dois lados (um goleiro pra cada time, zagueiros divididos...). "Sortear de novo" traz outra divisão equilibrada. O admin tem um botão que abre o registro do fut já com a escalação sorteada. O cabeçalho no celular também foi arrumado: os links descem pra uma segunda linha em vez de estourar a tela. Critérios em `src/lib/sorteio.ts` (#9)
- [x] **Foto na cartinha** — o admin escolhe a foto no cadastro ou na edição do jogador (com prévia na hora), pode trocar ou remover. O navegador recorta e reduz a foto antes de enviar, então foto de celular funciona direto. Sem foto, a carta continua com as iniciais. Fotos no Supabase Storage (#10)
- [x] **Identidade visual** — tema claro (camisa branca: mármore e azul-marinho) e escuro (camisa preta: rosas e dourado), seguindo o sistema ou escolhido no cabeçalho. Escudo do time no cabeçalho, no rodapé, nas cartinhas e no ícone da aba. Fontes retrô, cartinhas no modelo FUT (moldura de ouro, prata e bronze, foto grande, escudo do clube), placar com as cores das camisas, botão de voltar nas telas de edição. Pro admin, clicar na carta abre a edição (#11)
- [x] **Seleção do fut no campo** — página "Seleção" no menu com um campo de fut7 visto de cima e os melhores do fut por posição: 1 goleiro, 2 zagueiros, 2 meias e 2 atacantes, pela mesma nota do fut. Abre no último fut e dá pra escolher qualquer outro. Se faltar gente numa posição, a vaga vai pro melhor que sobrou (aparece como "improvisado"). As cartas da seleção são pretas, no estilo das cartas inform do FIFA, com o mesmo nível da carta normal e os números do fut (gols, assistências e pontos). Na página do fut, o top 5 virou "Destaques do fut", com um botão pra seleção no campo (#12)
- [x] **Limpeza visual** — gols e assistências no formato `2G/1A` nas listas, sem a contagem de jogadores no cabeçalho dos times, sem os pontos repetidos fora das cartas, "Marcar todos"/"Limpar" do sorteio com cara de botão e o "Registrar fut" alinhado com a lista. Abrir o `next dev` pelo IP da rede (pra testar no celular) era bloqueado como origem cruzada e a página não ficava clicável; liberado em `next.config.ts` (#12)

- [x] **Celular arrumado** — o cabeçalho cabia só em tela de 390px ou mais: abaixo disso "Sorteio" e "Sair" ficavam pra fora e a página inteira rolava de lado. Agora o escudo e o nome encolhem no celular, o "Sair" fica só com o ícone, o menu rola sozinho se precisar e o nome corta em vez de estourar a tela (testado de 320px a 430px). O menu da cartinha (copiar/baixar PNG), que só abria com o botão direito, abre com toque longo de meio segundo — segurar e arrastar continua rolando a página. Os campos de time/gols/assistência do fut foram pra 16px e 40px de altura, senão o Safari do iPhone dava zoom ao focar e o alvo de toque ficava pequeno; os campos de número abrem o teclado numérico. Na carta pequena do campo (seleção no celular), o que virava borrão de 4px — número da camisa, nome completo, ▲/▼ e os rótulos GOL/AST — some e sobram nível, posição, nome e os números (#20)

- [x] **Pronto pra Vercel** — validação geral antes do deploy: lint, build e TypeScript limpos, e uma passada de navegador em todas as telas (elenco, futs, detalhe do fut, rankings, seleção, sorteio, login e os formulários) em 320px, 390px e 1440px, nos dois temas, sem erro de console, sem requisição quebrada e sem rolagem lateral. Os fluxos de admin foram testados de ponta a ponta: criar, editar e excluir jogador e fut, validação do formulário, arquivamento de quem já jogou (o histórico continua) e upload de foto (sobe pro Storage, aparece na carta e some do bucket quando a foto é trocada ou o jogador excluído). Nenhum bug encontrado. A conexão com o banco foi ajustada pra serverless: na Vercel cada instância abre o próprio pool, então as conexões agora voltam pro pooler depois de 20s paradas e o pooler em modo transação (porta 6543) é reconhecido sozinho, desligando os prepared statements que ele não guarda (`src/data/db.ts`). Banco zerado: os 21 jogadores e 10 futs de teste foram apagados pra estrear com os dados reais (#21)

- [x] **Enquadrar a foto** — o recorte deixou de ser automático: ao escolher a foto abre um enquadramento com o quadrado que vai ser salvo, arrastando pra centralizar e aproximando pela barra, pela pinça (celular) ou pela roda do mouse. O círculo pontilhado mostra o que sobra no avatar. Na cartinha a foto virou um medalhão redondo menor, com moldura na cor da raridade, no lugar da foto grande que se desfazia num borrão embaixo. Dá pra reabrir pelo botão "Enquadrar" sem procurar o arquivo de novo, e "Trocar"/"Enquadrar"/"Remover" viraram botões do mesmo tamanho na mesma linha, no lugar de um chip pequeno embaixo do outro (#22)

- [x] **Seleção pelos números + troca na mão** — a seleção (e o craque, e os destaques do fut) usava a mesma nota do nível, que soma metade do saldo do time: num 20x12, quem fez 1 gol no time que ganhou passava na frente de quem fez 2G/1A no que perdeu. Agora é gols + assistências, com desempate por gols e depois pelo placar do time (que é o que separa goleiros e zagueiros). O nível das cartinhas continua com o saldo. O admin clica numa carta (ou vaga vazia) da seleção e escolhe qualquer um que jogou o fut, de qualquer posição; a lista mostra "escolhido na mão" e dá pra voltar pra escolha automática. As escolhas ficam na tabela `selecao_escolha` (migração `0007`) e quem não jogou mais o fut (fut editado) é ignorado

- [x] **Ajustes no celular** — na lista de futs com o "Editar" do admin, o placar espremia e só aparecia um lado, e o "Editar" (posicionado por cima do card) podia cobrir o placar quando o celular aumenta a letra; agora o "Editar" fica no fluxo ao lado do placar, que não encolhe, e o texto do resultado é que quebra linha. A carta pequena do campo (seleção no celular) voltou a mostrar o nome embaixo do apelido e os rótulos GOL/AST, maiores em relação à carta pra dar pra ler. O botão "Admin" do cabeçalho agora recarrega a página inteira: a navegação do Next não refaz o layout, então uma aba aberta antes do login (ou o atalho na tela inicial) continuava mostrando "Admin" mesmo logado, e tocar nele só voltava pro elenco. Depois do login você volta pra página onde estava

- [x] **No ar na Vercel** — https://pes-descalcos.vercel.app, publicando sozinho a cada merge na `main`. Testado no ar, no celular (360px) e no desktop: todas as telas abrem sem erro, as fotos carregam, nada rola de lado e as telas de admin mandam pro login sem sessão. Elenco de verdade cadastrado (20 jogadores, todos com foto) e o primeiro fut registrado

## Próximos passos

Nada urgente: o site está no ar. O próximo passo é ir tirando itens do "Mais pra frente" conforme a galera for usando.

## Mais pra frente

Sem ordem fechada, mais ou menos do mais útil pro mais enfeite:

- [ ] **Foto em outras telas** — a foto já aparece nas cartinhas (elenco e seleção do fut); falta levar pro sorteio, rankings e destaques do fut.
- [ ] **Rankings de temporadas passadas** — escolher um ano específico (hoje é só mês e ano atuais ou tudo).
- [ ] **Conquistas** — artilheiro do mês, sequência de presença, etc.
- [ ] **Evolução do jogador** — gráfico do nível fut a fut, na página do jogador (que ainda não existe: hoje a carta só abre a edição).
- [ ] **Time do ano** — a seleção do campo, mas com o ano inteiro. Fazer perto do fim do ano, reusando `escalarSelecao`.
- [ ] **Votação de MVP** — a galera vota no melhor de cada fut. Precisa de login por jogador.
- [ ] **Confirmação de presença** — a galera marca que vai no fut e o sorteio já abre com essa lista (hoje quem marca é quem está sorteando). Precisa de login por jogador.

## Pendências técnicas

- [ ] Senha de admin única para todos os admins; se entrarem mais pessoas, trocar por login individual.
- [ ] A senha de admin e o segredo da sessão na produção são os mesmos do desenvolvimento. Trocar na Vercel (e dar Redeploy) se o projeto deixar de ser só entre amigos.
- [ ] Jogador arquivado não tem tela pra voltar ao elenco; por enquanto é `update jogador set ativo = true` no banco.
- [ ] Sem testes automatizados: os fluxos são verificados a cada PR por um script de navegador contra o banco, mas o script é descartável e não está versionado.
- [ ] Os números do nível (5 de nível por ponto acima da média, variação máxima de 10, 3 jogos pra "confiar") foram calibrados com os dados de teste; revisar quando tiver uns 10 futs reais.
