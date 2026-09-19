"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/jogadores", label: "Elenco" },
  { href: "/futs", label: "Futs" },
  { href: "/rankings", label: "Rankings" },
  { href: "/sorteio", label: "Sorteio" },
];

export function Menu() {
  const caminho = usePathname();

  return (
    <ul className="flex items-center justify-between gap-2 font-numero text-xl tracking-wider uppercase md:justify-center md:gap-8">
      {ITENS.map(({ href, label }) => {
        const atual = caminho === href || caminho.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={atual ? "page" : undefined}
              className={`block border-b-2 px-1 pt-1 pb-0.5 transition ${
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
