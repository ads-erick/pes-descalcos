"use client";

import { usePathname } from "next/navigation";
import { botaoNav } from "@/lib/estilo";

// <a> de propósito, não <Link>: a navegação do Next não refaz o layout, então uma aba
// aberta antes do login (ou o atalho na tela inicial do celular) seguia com "Admin" no
// cabeçalho mesmo logado. O carregamento inteiro traz a faixa certa, e o login volta
// pra página onde a pessoa estava.
export function BotaoAdmin() {
  const caminho = usePathname();

  return (
    <a href={`/admin/login?destino=${encodeURIComponent(caminho)}`} className={botaoNav}>
      Admin
    </a>
  );
}
