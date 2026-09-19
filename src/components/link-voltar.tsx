import Link from "next/link";
import { botaoPequeno } from "@/lib/estilo";

export function LinkVoltar({ href, children = "Voltar" }: { href: string; children?: string }) {
  return (
    <Link href={href} className={botaoPequeno}>
      <svg
        viewBox="0 0 24 24"
        className="-mt-0.5 size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {children}
    </Link>
  );
}
