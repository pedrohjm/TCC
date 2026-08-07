import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sorveteria — Cardápio & Sistema",
  description: "Cardápio da sorveteria e sistema de registro de vendas (TCC)",
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
      <body className="min-h-full">
        <SidebarProvider>
          <AppSidebar papel={sessao?.user?.papel ?? null} />
          <SidebarInset>
            <header className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-5" />
              </div>
              {sessao?.user ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {sessao.user.name} <span className="text-muted-foreground/70">({sessao.user.papel})</span>
                  </span>
                  <form action={sair}>
                    <Button type="submit" variant="ghost" size="sm">
                      Sair
                    </Button>
                  </form>
                </div>
              ) : (
                <Button size="sm" render={<Link href="/login" />}>
                  Entrar
                </Button>
              )}
            </header>
            <div className="flex flex-1 flex-col">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
