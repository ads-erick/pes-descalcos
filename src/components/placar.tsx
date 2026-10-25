import { faixaTime } from "@/lib/estilo";
import { placarOrdenado, type CorTime } from "@/lib/selecao";

// Placar de estádio antigo: cada lado com a cor da sua camisa, o perdedor fica apagado.
// Fut que ainda não rolou mostra um traço de cada lado em vez do 0 x 0.
// O vencedor vem sempre na frente, então a ordem das cores muda com o resultado
export function Placar({
  branco,
  preto,
  grande,
  aRolar,
}: {
  branco: number;
  preto: number;
  grande?: boolean;
  aRolar?: boolean;
}) {
  const perdeu = (cor: CorTime) =>
    (cor === "branco" ? branco < preto : preto < branco) ? "opacity-45" : "";
  const tamanho = grande
    ? "min-w-16 px-4 pt-2 pb-1 text-6xl sm:min-w-20 sm:text-7xl"
    : "min-w-10 px-2 pt-1 text-3xl";

  const { primeiro } = placarOrdenado(branco, preto);
  const lados: CorTime[] = primeiro === "branco" ? ["branco", "preto"] : ["preto", "branco"];

  return (
    <div className="flex shrink-0 items-stretch overflow-hidden rounded-md border-2 border-tinta font-numero leading-none tabular-nums">
      {lados.map((cor) => (
        <span key={cor} className={`grid place-items-center ${tamanho} ${faixaTime[cor]}`}>
          <span className={perdeu(cor)}>{aRolar ? "–" : cor === "branco" ? branco : preto}</span>
        </span>
      ))}
    </div>
  );
}
