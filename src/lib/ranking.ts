export const PERIODOS = ["mes", "ano", "tudo"] as const;

export type Periodo = (typeof PERIODOS)[number];

export const PERIODO_PADRAO: Periodo = "ano";

export const PERIODO_LABEL: Record<Periodo, string> = {
  mes: "Este mês",
  ano: "Este ano",
  tudo: "Desde sempre",
};

export function lerPeriodo(valor: unknown): Periodo {
  return PERIODOS.includes(valor as Periodo) ? (valor as Periodo) : PERIODO_PADRAO;
}

// Data de hoje no fuso da galera, não no do servidor (a Vercel roda em UTC)
function hoje() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

// Primeiro dia do período no formato YYYY-MM-DD, ou null pra não filtrar
export function inicioDoPeriodo(periodo: Periodo): string | null {
  const data = hoje();
  if (periodo === "mes") return `${data.slice(0, 7)}-01`;
  if (periodo === "ano") return `${data.slice(0, 4)}-01-01`;
  return null;
}

export function descreverPeriodo(periodo: Periodo): string {
  const data = hoje();
  if (periodo === "ano") return `Temporada ${data.slice(0, 4)}`;
  if (periodo === "mes") {
    const mes = new Date(`${data.slice(0, 7)}-15T12:00:00`).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return mes[0].toUpperCase() + mes.slice(1);
  }
  return "Todos os futs";
}

export type Colocado<T> = T & { colocacao: number };

// Empate divide a colocação (1, 1, 3...). Quem tem zero fica de fora.
export function rankear<T extends { nome: string }>(
  itens: T[],
  valor: (item: T) => number,
): Colocado<T>[] {
  const ordenados = itens
    .filter((item) => valor(item) > 0)
    .sort((a, b) => valor(b) - valor(a) || a.nome.localeCompare(b.nome, "pt-BR"));

  return ordenados.map((item, i) => {
    let primeiro = i;
    while (primeiro > 0 && valor(ordenados[primeiro - 1]) === valor(item)) primeiro--;
    return { ...item, colocacao: primeiro + 1 };
  });
}
