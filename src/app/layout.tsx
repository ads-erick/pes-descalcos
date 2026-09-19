import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { isAdmin } from "@/data/auth";
import { logoutAction } from "./admin/actions";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Pés Descalços", template: "%s · Pés Descalços" },
  description: "Cartinhas, estatísticas e seleção do fut da galera.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const admin = await isAdmin();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/jogadores" className="font-black tracking-tight">
              Pés Descalços
            </Link>
            <div className="flex items-center gap-3 text-sm sm:gap-4">
              <Link href="/jogadores" className="hover:underline">
                Jogadores
              </Link>
              <Link href="/futs" className="hover:underline">
                Futs
              </Link>
              <Link href="/rankings" className="hover:underline">
                Rankings
              </Link>
              {admin ? (
                <form action={logoutAction}>
                  <button type="submit" className="text-zinc-500 hover:underline">
                    Sair
                  </button>
                </form>
              ) : (
                <Link href="/admin/login" className="text-zinc-500 hover:underline">
                  Admin
                </Link>
              )}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
