// Título das páginas no estilo do escudo: slab pesada, caixa alta
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
        <h1 className="font-slab text-3xl leading-tight uppercase sm:text-4xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-apagado">{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}
