import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { FundoPagina } from "@/components/FundoPagina";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      <body className="h-full">
        <FundoPagina />

        {/* O app inteiro fica dentro dessa "janela" centralizada — o fundo
            (FundoPagina) aparece na margem ao redor dela. */}
        <div className="flex min-h-svh items-center justify-center p-3 sm:p-6 lg:p-10">
          <div className="flex h-[calc(100svh-1.5rem)] w-full max-w-[1440px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl sm:h-[calc(100svh-3rem)] lg:h-[calc(100svh-5rem)]">
            <SidebarProvider className="h-full min-h-0 w-full flex-col">
              <header className="flex items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 py-2.5 text-sidebar-foreground">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                  <Link href="/" className="flex items-center gap-2">
                    <Avatar className="rounded-lg bg-white after:rounded-lg">
                      <AvatarImage
                        src="/images/logo/Logo.png"
                        alt="Logo da Q10 Sorvetes"
                        className="rounded-lg object-contain p-0.5"
                      />
                      <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Store className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">Q10 Sorvetes</span>
                  </Link>
                </div>
                {sessao?.user ? (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="hidden text-sidebar-foreground/70 sm:inline">
                      {sessao.user.name} <span className="text-sidebar-foreground/50">({sessao.user.papel})</span>
                    </span>
                    <form action={sair}>
                      <Button type="submit" variant="ghost" size="sm">
                        Sair
                      </Button>
                    </form>
                  </div>
                ) : (
                  <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
                    Entrar
                  </Button>
                )}
              </header>

              <div className="flex min-h-0 flex-1">
                <AppSidebar papel={sessao?.user?.papel ?? null} />
                <SidebarInset className="min-h-0 overflow-y-auto">{children}</SidebarInset>
              </div>
            </SidebarProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
