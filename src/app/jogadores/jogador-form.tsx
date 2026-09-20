"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  criarJogadorAction,
  editarJogadorAction,
  type JogadorFormState,
} from "@/app/jogadores/actions";
import { JogadorCard } from "@/components/jogador-card";
import type { JogadorEditavel, JogadorResumo } from "@/data/jogadores";
import { botaoPerigoChip, botaoPrimario, botaoSecundario, campo } from "@/lib/estilo";
import { reduzirFoto } from "@/lib/foto";
import { POSICAO_LABEL, POSICOES, type Posicao, iniciais } from "@/lib/jogador";
import { NIVEL_MAX, NIVEL_MIN, NIVEL_PADRAO } from "@/lib/nivel";

export function JogadorForm({
  jogador,
  carta,
  children,
}: {
  jogador?: JogadorEditavel;
  // Cartinha atual de quem já está no elenco: de onde saem os números da carreira
  // e a variação de nível que as estatísticas já deram
  carta?: JogadorResumo;
  children?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<JogadorFormState, FormData>(
    jogador ? editarJogadorAction : criarJogadorAction,
    {},
  );
  const [foto, setFoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // A foto original fica fora do form (input sem name); vai só a versão reduzida
  function enviar(formData: FormData) {
    if (foto) formData.set("foto", foto.blob, "foto.jpg");
    action(formData);
  }
  // Depois de um erro de validação, mostra o que foi digitado, não o valor salvo
  const valores = state.valores ?? {
    nome: jogador?.nome ?? "",
    apelido: jogador?.apelido ?? "",
    numero: jogador?.numero?.toString() ?? "",
    posicao: jogador?.posicao ?? "",
    nivelBase: String(jogador?.nivelBase ?? NIVEL_PADRAO),
  };

  // Os campos seguem sem controle do React; a prévia só espelha o que está digitado
  const [previa, setPrevia] = useState(valores);
  function espelhar() {
    const dados = new FormData(formRef.current!);
    const texto = (nome: string) => String(dados.get(nome) ?? "");
    setPrevia({
      nome: texto("nome"),
      apelido: texto("apelido"),
      numero: texto("numero"),
      posicao: texto("posicao"),
      nivelBase: texto("nivelBase"),
    });
  }

  const fotoAtual = removerFoto ? null : (foto?.url ?? jogador?.fotoUrl ?? null);

  const entreLimites = (n: number) => Math.min(NIVEL_MAX, Math.max(NIVEL_MIN, n));
  const nivelBase = previa.nivelBase.trim()
    ? entreLimites(Number(previa.nivelBase) || NIVEL_PADRAO)
    : NIVEL_PADRAO;
  const numero = Number(previa.numero);

  const cartaPrevia: JogadorResumo = {
    id: jogador?.id ?? "previa",
    nome: previa.nome.trim() || "Nome do jogador",
    apelido: previa.apelido.trim() || null,
    numero: previa.numero.trim() && Number.isFinite(numero) ? numero : null,
    posicao: POSICOES.includes(previa.posicao as Posicao) ? (previa.posicao as Posicao) : null,
    fotoUrl: fotoAtual,
    jogos: carta?.jogos ?? 0,
    gols: carta?.gols ?? 0,
    assistencias: carta?.assistencias ?? 0,
    nivelBase,
    // O que os futs já somaram (ou tiraram) continua valendo, pra prévia bater com o elenco
    nivel: entreLimites(nivelBase + (carta ? carta.nivel - carta.nivelBase : 0)),
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start lg:gap-24 xl:gap-32">
      <form ref={formRef} onChange={espelhar} action={enviar} className="space-y-4">
        {jogador && <input type="hidden" name="id" value={jogador.id} />}
        {removerFoto && <input type="hidden" name="removerFoto" value="on" />}

        <CampoFoto
          atual={fotoAtual}
          iniciais={iniciais(previa.apelido || previa.nome || "?")}
          erroServidor={state.erros?.foto?.[0]}
          aoEscolher={(nova) => {
            if (foto) URL.revokeObjectURL(foto.url);
            setFoto(nova);
            setRemoverFoto(false);
          }}
          aoRemover={() => {
            if (foto) URL.revokeObjectURL(foto.url);
            setFoto(null);
            setRemoverFoto(Boolean(jogador?.fotoUrl));
          }}
        />

        <Campo label="Nome" name="nome" erros={state.erros?.nome}>
          <input
            id="nome"
            name="nome"
            required
            maxLength={80}
            defaultValue={valores.nome}
            className={campo}
          />
        </Campo>

        <Campo label="Apelido (aparece na cartinha)" name="apelido" erros={state.erros?.apelido}>
          <input
            id="apelido"
            name="apelido"
            maxLength={40}
            defaultValue={valores.apelido}
            className={campo}
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Número" name="numero" erros={state.erros?.numero}>
            <input
              id="numero"
              name="numero"
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              defaultValue={valores.numero}
              className={campo}
            />
          </Campo>

          <Campo label="Posição" name="posicao" erros={state.erros?.posicao}>
            <select id="posicao" name="posicao" defaultValue={valores.posicao} className={campo}>
              <option value="">–</option>
              {POSICOES.map((posicao) => (
                <option key={posicao} value={posicao}>
                  {POSICAO_LABEL[posicao]}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        <Campo label="Nível" name="nivelBase" erros={state.erros?.nivelBase}>
          <input
            id="nivelBase"
            name="nivelBase"
            type="number"
            inputMode="numeric"
            required
            min={NIVEL_MIN}
            max={NIVEL_MAX}
            defaultValue={valores.nivelBase}
            aria-describedby="nivelBase-ajuda"
            className={campo}
          />
          <p id="nivelBase-ajuda" className="mt-1 text-xs text-apagado">
            De {NIVEL_MIN} a {NIVEL_MAX} (bronze até 69, prata até 79, ouro a partir de 80).
          </p>
        </Campo>

        <div className="flex items-center justify-end gap-3 pt-2">
          {children && <div className="mr-auto">{children}</div>}
          <Link href="/jogadores" className={botaoSecundario}>
            Cancelar
          </Link>
          <button type="submit" disabled={pending} className={botaoPrimario}>
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>

      {/* No celular a carta vai pra cima do formulário, menorzinha */}
      <aside className="order-first mx-auto w-44 sm:w-52 lg:sticky lg:top-8 lg:order-none lg:mx-auto lg:w-full lg:max-w-[19rem]">
        <JogadorCard jogador={cartaPrevia} />
      </aside>
    </div>
  );
}

function CampoFoto({
  atual,
  iniciais,
  erroServidor,
  aoEscolher,
  aoRemover,
}: {
  atual: string | null;
  iniciais: string;
  erroServidor?: string;
  aoEscolher: (foto: { blob: Blob; url: string }) => void;
  aoRemover: () => void;
}) {
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;

    setProcessando(true);
    setErro(null);
    try {
      const blob = await reduzirFoto(arquivo);
      aoEscolher({ blob, url: URL.createObjectURL(blob) });
    } catch {
      setErro("Não deu pra abrir essa imagem. Tente uma foto JPG ou PNG.");
    } finally {
      setProcessando(false);
    }
  }

  const mensagem = erro ?? erroServidor;

  return (
    <div>
      {/* Sem rótulo: o avatar clicável e o botão de escolher foto já dizem o que é */}
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-linha bg-superficie-2 font-slab text-2xl text-apagado">
          {atual ? (
            <Image
              src={atual}
              alt="Foto do jogador"
              width={80}
              height={80}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            iniciais
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <label
            className={`${botaoSecundario} cursor-pointer`}
          >
            {processando ? "Preparando..." : atual ? "Trocar foto" : "Escolher foto"}
            <input
              id="foto"
              type="file"
              accept="image/*"
              onChange={escolher}
              disabled={processando}
              className="sr-only"
            />
          </label>
          {atual && (
            <button type="button" onClick={aoRemover} className={botaoPerigoChip}>
              Remover foto
            </button>
          )}
        </div>
      </div>
      {mensagem && (
        <p role="alert" className="mt-1 text-sm text-perigo">
          {mensagem}
        </p>
      )}
    </div>
  );
}

function Campo({
  label,
  name,
  erros,
  children,
}: {
  label: string;
  name: string;
  erros?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {erros?.[0] && (
        <p role="alert" className="mt-1 text-sm text-perigo">
          {erros[0]}
        </p>
      )}
    </div>
  );
}
