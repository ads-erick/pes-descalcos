import type { Metadata } from "next";
import { Alfa_Slab_One, Barlow, Bebas_Neue, Caveat_Brush } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import { BotaoAdmin } from "@/components/botao-admin";
import { BotaoTema } from "@/components/botao-tema";
import { Menu } from "@/components/menu";
import { isAdmin } from "@/data/auth";
import { botaoNav } from "@/lib/estilo";
import { logoutAction } from "./admin/actions";
import "./globals.css";

// Slab do escudo, números de camisa, texto corrido e letra de pincel pros detalhes
const slab = Alfa_Slab_One({ variable: "--fonte-slab", weight: "400", subsets: ["latin"] });
const numero = Bebas_Neue({ variable: "--fonte-numero", weight: "400", subsets: ["latin"] });
const texto = Barlow({
  variable: "--fonte-texto",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const script = Caveat_Brush({ variable: "--fonte-script", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Pés Descalços FC", template: "%s · Pés Descalços FC" },
  description: "Cartinhas, estatísticas e seleção do fut da galera.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [admin, cookieStore] = await Promise.all([isAdmin(), cookies()]);
  const tema = cookieStore.get("tema")?.value;

  return (
    <html
      lang="pt-BR"
      data-tema={tema === "claro" || tema === "escuro" ? tema : undefined}
      className={`${slab.variable} ${numero.variable} ${texto.variable} ${script.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="listras-ombro border-b-2 border-realce bg-faixa text-sobre-faixa">
          {/* Até 1023px: marca + ações em cima, menu embaixo. A partir de 1024px: marca | menu | ações
              (antes disso, em tablet, a marca invadia o menu) */}
          <nav className="mx-auto grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 px-4 py-3 sm:gap-x-4 lg:grid-cols-[1fr_auto_1fr]">
            {/* min-w-0 + truncate: em tela muito estreita o nome corta em vez de
                empurrar a faixa e dar rolagem lateral na página inteira. O truncate corta o que
                passa da linha, então ela precisa de folga pro acento do É */}
            <Link
              href="/jogadores"
              className="flex max-w-full min-w-0 items-center gap-2 justify-self-start sm:gap-3 lg:max-w-none"
            >
              <span className="escudo h-9 shrink-0 text-realce sm:h-11" aria-hidden />
              <span className="min-w-0 truncate py-0.5 font-slab text-base leading-tight whitespace-nowrap uppercase sm:text-lg">
                Pés Descalços
                <span className="ml-1.5 align-top font-numero text-sm tracking-widest text-realce">
                  FC
                </span>
              </span>
            </Link>

            {/* O -mx-4/px-4 estende a rolagem até a borda da tela; o overflow também
                impede que o menu estique a coluna do grid em tela estreita */}
            <div className="order-3 col-span-2 -mx-4 overflow-x-auto border-t border-realce/25 px-4 pt-2 lg:order-2 lg:col-span-1 lg:mx-0 lg:overflow-x-visible lg:border-0 lg:px-0 lg:pt-0">
              <Menu />
            </div>

            <div className="order-2 flex shrink-0 items-center gap-2 justify-self-end sm:gap-3 lg:order-3">
              <BotaoTema />
              {admin ? (
                <form action={logoutAction}>
                  {/* No celular fica só o ícone: o texto ao lado estourava a faixa */}
                  <button type="submit" aria-label="Sair" className={`${botaoNav} px-2.5 sm:px-3`}>
                    <svg
                      viewBox="0 0 24 24"
                      className="-mt-0.5 size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </form>
              ) : (
                <BotaoAdmin />
              )}
            </div>
          </nav>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="mt-12 border-t-2 border-realce bg-faixa text-sobre-faixa">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 py-6 text-center text-sm sm:flex-row sm:justify-between sm:text-left">
            <span className="flex items-center gap-2 font-slab uppercase">
              <span className="escudo h-8 text-realce" aria-hidden />
              Pés Descalços FC
            </span>
            <p className="opacity-70">
              © {new Date().getFullYear()} Pés Descalços FC. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
