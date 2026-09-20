import { tituloPagina } from "@/lib/estilo";

export function CabecalhoPagina({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className={tituloPagina}>{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-apagado">{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}
