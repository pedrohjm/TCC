import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sorveteria — Registro de Vendas",
  description: "Sistema de registro de vendas para sorveteria (TCC)",
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
      <body className="min-h-full flex flex-col">
        {sessao?.user && (
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 text-sm">
            <span className="text-gray-700">
              {sessao.user.name} <span className="text-gray-400">({sessao.user.papel})</span>
            </span>
            <form action={sair}>
              <button type="submit" className="text-gray-500 underline hover:text-gray-900">
                Sair
              </button>
            </form>
          </header>
        )}
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
