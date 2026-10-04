import { tituloPagina } from "@/lib/estilo";

export function CabecalhoPagina({
  titulo,
  subtitulo,
  centralizado = false,
  children,
}: {
  titulo: string;
  subtitulo?: React.ReactNode;
  // Pra tela de uma coluna só, sem ação no canto (o sorteio)
  centralizado?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`mb-8 flex flex-wrap items-end gap-4 ${
        centralizado ? "justify-center text-center" : "justify-between"
      }`}
    >
      <div>
        <h1 className={tituloPagina}>{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-apagado">{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}
