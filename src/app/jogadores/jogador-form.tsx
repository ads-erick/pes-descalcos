"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  criarJogadorAction,
  editarJogadorAction,
  type JogadorFormState,
} from "@/app/jogadores/actions";
import type { JogadorEditavel } from "@/data/jogadores";
import { botaoPrimario, botaoSecundario, campo, link } from "@/lib/estilo";
import { reduzirFoto } from "@/lib/foto";
import { POSICAO_LABEL, POSICOES, iniciais } from "@/lib/jogador";
import { NIVEL_MAX, NIVEL_MIN, NIVEL_PADRAO } from "@/lib/nivel";

export function JogadorForm({
  jogador,
  children,
}: {
  jogador?: JogadorEditavel;
  children?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<JogadorFormState, FormData>(
    jogador ? editarJogadorAction : criarJogadorAction,
    {},
  );
  const [foto, setFoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);

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

  return (
    <form action={enviar} className="space-y-4">
      {jogador && <input type="hidden" name="id" value={jogador.id} />}
      {removerFoto && <input type="hidden" name="removerFoto" value="on" />}

      <CampoFoto
        atual={removerFoto ? null : (foto?.url ?? jogador?.fotoUrl ?? null)}
        iniciais={iniciais(valores.apelido || valores.nome || "?")}
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
          <select
            id="posicao"
            name="posicao"
            defaultValue={valores.posicao}
            className={campo}
          >
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
        <Link href="/jogadores" className={`px-2 text-sm ${link}`}>
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className={botaoPrimario}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
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
      <p className="mb-1 block text-sm font-semibold">Foto</p>
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
          <label className={`${botaoSecundario} cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-destaque`}>
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
            <button
              type="button"
              onClick={aoRemover}
              className={`px-1 text-sm ${link}`}
            >
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
