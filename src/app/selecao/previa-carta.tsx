"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Quem está escolhido no campo. Só o id viaja: as cartas já vêm
// prontas do servidor pra prévia, que apenas escolhe qual mostrar.
// Passar o mouse — ou clicar — troca a carta, e ela fica: tirar o mouse não
// desfaz a escolha
const Escolher = createContext<(id: string) => void>(() => {});
const Escolhido = createContext<string | null>(null);

export function PreviaCartas({ padrao, children }: { padrao?: string; children: ReactNode }) {
  const [escolhido, escolher] = useState<string | null>(padrao ?? null);

  return (
    <Escolher.Provider value={escolher}>
      <Escolhido.Provider value={escolhido}>{children}</Escolhido.Provider>
    </Escolher.Provider>
  );
}

export function AlvoPrevia({
  id,
  className,
  style,
  children,
}: {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const escolher = useContext(Escolher);

  return (
    <div
      className={className}
      style={style}
      onMouseEnter={() => escolher(id)}
      onClick={() => escolher(id)}
    >
      {children}
    </div>
  );
}

export function Previa({
  cartas,
  className,
}: {
  cartas: { id: string; carta: ReactNode }[];
  className?: string;
}) {
  const escolhido = useContext(Escolhido);
  // Antes de qualquer escolha (ou se o escolhido não está neste fut), o craque
  // abre a prévia — o espaço nunca fica vazio
  const atual = cartas.some((c) => c.id === escolhido) ? escolhido : cartas[0]?.id;

  return (
    <div className={className}>
      {/* Todas ficam montadas e só uma aparece: assim a foto não recarrega a cada hover.
          A largura sai da altura da janela pra carta, que é alta, não passar do fim da tela */}
      <div className="relative mx-auto w-[min(16rem,22vh)]">
        {cartas.map(({ id, carta }) => (
          <div key={id} className={id === atual ? "" : "invisible absolute inset-0"}>
            {carta}
          </div>
        ))}
      </div>
    </div>
  );
}
