import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { FundoPagina } from "@/components/FundoPagina";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TituloPagina } from "@/components/TituloPagina";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";

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
      // suppressHydrationWarning: o next-themes injeta um script que aplica
      // a classe "dark" no <html> antes do React hidratar (pra não piscar o
      // tema errado); isso faz o atributo class do servidor e do client
      // divergirem de propósito, e sem essa flag o React reclamaria disso.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Layout copiado do modelo em public/images/modelo (taskbarhero.wiki):
          barra do topo ocupando a largura toda, e abaixo dela dois painéis
          separados (menu + conteúdo) num quadro estreito e centralizado, com
          o fundo aparecendo nas laterais. As medidas (quadro ~1056px, menu
          252px, 16px de espaço entre os painéis) vieram de medir o site de
          referência. */}
      <body className="flex h-svh flex-col overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FundoPagina />

          <SidebarProvider className="contents">
            {/* Barra do topo — isolada, largura total, logo à esquerda e
                login/usuário à direita. */}
            <header className="shrink-0 border-b border-black/10 bg-sidebar/90 backdrop-blur-sm dark:border-white/10">
              {/* Mesmo max-w-[1080px] + px-4 do quadro central logo abaixo,
                  pra a logo alinhar com a borda esquerda do painel do menu
                  em vez de ficar colada na borda da janela do navegador. */}
              <div className="mx-auto flex w-full max-w-[1080px] items-center justify-between gap-3 px-4 py-2">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                  {/* Logo em formato de banner — a imagem já traz o nome da
                      loja escrito nela, então mostramos ela grande e sem
                      caixa/borda ao redor, em vez do bloco quadrado de antes. */}
                  <Link href="/" className="flex items-center gap-2 py-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/logo/Logo.png"
                      alt="Q10 Sorvetes"
                      className="h-10 w-auto object-contain"
                    />
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      Cardápio &amp; sistema
                    </span>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  {sessao?.user ? (
                    <>
                      <span className="hidden text-sm text-muted-foreground sm:inline">
                        {sessao.user.name}{" "}
                        <span className="text-muted-foreground/70">({sessao.user.papel})</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href="/perfil" />}
                        aria-label="Editar perfil"
                      >
                        <UserCog />
                      </Button>
                      <form action={sair}>
                        <Button type="submit" variant="outline" size="sm">
                          Sair
                        </Button>
                      </form>
                    </>
                  ) : (
                    <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
                      Entrar
                    </Button>
                  )}
                </div>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
