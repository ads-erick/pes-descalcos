"use client";

import { botaoNav } from "@/lib/estilo";

// Troca claro/escuro na hora e grava no cookie, pro servidor já renderizar certo na próxima visita
export function BotaoTema() {
  function alternar() {
    const raiz = document.documentElement;
    const escuroAgora =
      raiz.dataset.tema === "escuro" ||
      (!raiz.dataset.tema && matchMedia("(prefers-color-scheme: dark)").matches);
    const novo = escuroAgora ? "claro" : "escuro";
    raiz.dataset.tema = novo;
    document.cookie = `tema=${novo}; path=/; max-age=31536000; samesite=lax`;
  }

  // Os dois estados vão no HTML e o CSS mostra o certo: sem piscar ao carregar
  return (
    <button type="button" onClick={alternar} aria-label="Alternar tema claro/escuro" className={botaoNav}>
      <span className="flex items-center gap-2 dark:hidden">
        <svg viewBox="0 0 24 24" className="-mt-0.5 size-4" fill="currentColor" aria-hidden>
          <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z" />
        </svg>
        <span className="hidden sm:inline">Escuro</span>
      </span>
      <span className="hidden items-center gap-2 dark:flex">
        <svg
          viewBox="0 0 24 24"
          className="-mt-0.5 size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        <span className="hidden sm:inline">Claro</span>
      </span>
    </button>
  );
}
