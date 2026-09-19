import type { Metadata } from "next";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { isAdmin } from "@/data/auth";
import { listarJogadores } from "@/data/jogadores";
import { vazio } from "@/lib/estilo";
import { SorteioTimes } from "./sorteio-times";

export const metadata: Metadata = { title: "Sorteio de times" };

export default async function SorteioPage() {
  const [jogadores, admin] = await Promise.all([listarJogadores(), isAdmin()]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <CabecalhoPagina
        titulo="Sorteio"
        subtitulo="Marque quem vai jogar e o sorteio divide branco x preto pelo nível das cartinhas."
      />

      {jogadores.length < 2 ? (
        <p className={vazio}>
          Precisa de pelo menos dois jogadores cadastrados pra sortear.
        </p>
      ) : (
        <SorteioTimes
          admin={admin}
          jogadores={jogadores.map((j) => ({
            id: j.id,
            nome: j.apelido ?? j.nome,
            posicao: j.posicao,
            nivel: j.nivel,
          }))}
        />
      )}
    </main>
  );
}
