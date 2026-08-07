import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { FundoPagina } from "@/components/FundoPagina";
import { TituloPagina } from "@/components/TituloPagina";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Q10 Sorvetes — Cardápio & Sistema",
  description: "Cardápio da Q10 Sorvetes e sistema de registro de vendas (TCC)",
};

async function sair() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessao = await auth();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Layout copiado do modelo em public/images/modelo (taskbarhero.wiki):
          barra do topo ocupando a largura toda, e abaixo dela dois painéis
          separados (menu + conteúdo) num quadro estreito e centralizado, com
          o fundo aparecendo nas laterais. As medidas (quadro ~1056px, menu
          252px, 16px de espaço entre os painéis) vieram de medir o site de
          referência. */}
      <body className="flex h-svh flex-col overflow-hidden">
        <FundoPagina />

        <SidebarProvider className="contents">
          {/* Barra do topo — isolada, largura total, logo à esquerda e
              login/usuário à direita. */}
          <header className="shrink-0 border-b border-black/10 bg-sidebar/90 backdrop-blur-sm dark:border-white/10">
            <div className="flex items-center justify-between gap-3 px-4 py-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-lg border border-primary/40 bg-background/70 px-2.5 py-1.5 shadow-sm transition-colors hover:border-primary/70"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo/Logo.png"
                    alt=""
                    className="h-7 w-7 rounded object-contain"
                  />
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">Q10 Sorvetes</span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      Cardápio &amp; sistema
                    </span>
                  </span>
                </Link>
              </div>

              {sessao?.user ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="hidden text-muted-foreground sm:inline">
                    {sessao.user.name}{" "}
                    <span className="text-muted-foreground/70">({sessao.user.papel})</span>
                  </span>
                  <form action={sair}>
                    <Button type="submit" variant="outline" size="sm">
                      Sair
                    </Button>
                  </form>
                </div>
              ) : (
                <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
                  Entrar
                </Button>
              )}
            </div>
          </header>

          {/* Quadro central: menu e conteúdo são dois painéis separados. */}
          <div className="mx-auto flex w-full min-h-0 max-w-[1080px] flex-1 gap-4 p-4">
            <AppSidebar papel={sessao?.user?.papel ?? null} />

            <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-background shadow-lg">
              <div className="shrink-0 border-b border-border/70 bg-gradient-to-r from-primary/85 via-primary to-primary/85 px-4 py-2 text-center text-sm font-semibold tracking-wide text-primary-foreground">
                <TituloPagina />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
