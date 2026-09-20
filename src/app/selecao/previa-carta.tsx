"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Quem o mouse está apontando no campo (ou na lista). Só o id viaja: as cartas
// já vêm prontas do servidor pra prévia, que apenas escolhe qual mostrar
const Foco = createContext<(id: string | null) => void>(() => {});
const EmFoco = createContext<string | null>(null);

export function PreviaCartas({ children }: { children: ReactNode }) {
  const [emFoco, mirar] = useState<string | null>(null);

  return (
    <Foco.Provider value={mirar}>
      <EmFoco.Provider value={emFoco}>{children}</EmFoco.Provider>
    </Foco.Provider>
  );
}

export function AlvoPrevia({
  id,
  como: Como = "div",
  className,
  style,
  children,
}: {
  id: string;
  como?: "div" | "li";
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const mirar = useContext(Foco);

  return (
    <Como
      className={className}
      style={style}
      onMouseEnter={() => mirar(id)}
      onMouseLeave={() => mirar(null)}
    >
      {children}
    </Como>
  );
}

export function Previa({
  cartas,
  padrao,
  className,
}: {
  cartas: { id: string; carta: ReactNode }[];
  padrao?: string;
  className?: string;
}) {
  const emFoco = useContext(EmFoco);
  // Sem ninguém no mouse, fica a carta do craque — o espaço nunca fica vazio
  const atual =
    (cartas.some((c) => c.id === emFoco) ? emFoco : null) ??
    (cartas.some((c) => c.id === padrao) ? padrao : cartas[0]?.id);

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
