import { faixaTime } from "@/lib/estilo";
import type { CorTime } from "@/lib/selecao";

// Placar de estádio antigo: cada lado com a cor da sua camisa, o perdedor fica apagado
export function Placar({
  branco,
  preto,
  grande,
}: {
  branco: number;
  preto: number;
  grande?: boolean;
}) {
  const perdeu = (cor: CorTime) =>
    (cor === "branco" ? branco < preto : preto < branco) ? "opacity-45" : "";
  const tamanho = grande
    ? "min-w-16 px-4 pt-2 pb-1 text-6xl sm:min-w-20 sm:text-7xl"
    : "min-w-10 px-2 pt-1 text-3xl";

  return (
    <div className="flex items-stretch overflow-hidden rounded-md border-2 border-tinta font-numero leading-none tabular-nums">
      <span className={`grid place-items-center ${tamanho} ${faixaTime.branco}`}>
        <span className={perdeu("branco")}>{branco}</span>
      </span>
      <span className={`grid place-items-center ${tamanho} ${faixaTime.preto}`}>
        <span className={perdeu("preto")}>{preto}</span>
      </span>
    </div>
  );
}
