import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leitura Nova - Gestão Inteligente de Água e Gás para Condomínios",
  description: "Soluções especializadas em leitura e gestão de consumo de água e gás para condomínios. Monitoramento individual e automatizado com tecnologia de ponta.",
  keywords: "leitura de água, leitura de gás, condomínio, telemetria, individualização, hidrômetro, medidor de gás",
  authors: [{ name: "Leitura Nova" }],
  openGraph: {
    title: "Leitura Nova - Gestão Inteligente de Água e Gás para Condomínios",
    description: "Soluções especializadas em leitura e gestão de consumo de água e gás para condomínios.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
