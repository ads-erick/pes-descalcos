"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/jogadores", label: "Elenco" },
  { href: "/futs", label: "Futs" },
  { href: "/selecao", label: "Seleção" },
  { href: "/rankings", label: "Rankings" },
  { href: "/sorteio", label: "Sorteio" },
];

export function Menu() {
  const caminho = usePathname();

  return (
    <ul className="flex items-center justify-between gap-1 font-numero text-lg tracking-wider uppercase sm:gap-2 sm:text-xl md:justify-center md:gap-10 lg:gap-8">
      {ITENS.map(({ href, label }) => {
        const atual = caminho === href || caminho.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={atual ? "page" : undefined}
              className={`block rounded-sm border-b-2 px-1 pt-1 pb-0.5 transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado ${
                atual
                  ? "border-dourado text-dourado"
                  : "border-transparent text-sobre-faixa/80 hover:text-dourado"
              }`}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
