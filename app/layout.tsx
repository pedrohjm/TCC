import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FundoPagina } from "@/components/FundoPagina";
import { ThemeProvider } from "@/components/ThemeProvider";

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

// Layout raiz: só o que é comum a tudo (fontes, tema, fundo). O formato
// da página em si fica nos grupos de rota, todos de largura cheia com o
// documento rolando:
//
// - app/(landing)/  → a home, a visão do cliente, com menu de seções na
//   barra do topo;
// - app/(sistema)/  → o painel da equipe (/painel) e o editar perfil;
// - app/(auth)/     → entrar e criar conta, que ocupam a tela inteira.
//
// Grupos de rota não aparecem na URL, então "/painel" é só "/painel" — o
// proxy.ts não precisa saber que grupos existem.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      // suppressHydrationWarning: o next-themes injeta um script que aplica
      // a classe "dark" no <html> antes do React hidratar (pra não piscar o
      // tema errado); isso faz o atributo class do servidor e do client
      // divergirem de propósito, e sem essa flag o React reclamaria disso.
      suppressHydrationWarning
      // motion-safe:scroll-smooth: os links do menu de seções da landing
      // são âncoras (#cardapio, #sobre...), e sem isso o navegador salta
      // seco até a seção. `motion-safe` respeita quem pediu menos
      // animação no sistema.
      className={`${geistSans.variable} ${geistMono.variable} antialiased motion-safe:scroll-smooth`}
    >
      <body className="min-h-svh">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FundoPagina />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
