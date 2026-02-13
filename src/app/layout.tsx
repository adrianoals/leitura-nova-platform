import type { Metadata } from "next";
import "./globals.css";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://leituranova.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Leitura Nova | Gestão Inteligente de Água e Gás para Condomínios",
    template: "%s | Leitura Nova",
  },
  description:
    "Soluções de leitura e gestão de consumo de água e gás para condomínios. Telemetria, medição visual, relatórios e economia comprovada. Solicite uma avaliação.",
  keywords: [
    "gestão de consumo",
    "água condomínio",
    "gás condomínio",
    "hidrômetro",
    "telemetria",
    "individualização",
    "leitura remota",
    "Leitura Nova",
  ],
  authors: [{ name: "Leitura Nova" }],
  creator: "Leitura Nova",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Leitura Nova",
    title: "Leitura Nova | Gestão Inteligente de Água e Gás para Condomínios",
    description:
      "Soluções de leitura e gestão de consumo de água e gás para condomínios. Telemetria, medição visual e economia comprovada.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leitura Nova | Gestão de Água e Gás para Condomínios",
    description: "Soluções de leitura e gestão de consumo para condomínios. Solicite uma avaliação.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
  verification: {
    google: "-PDjDMtCa0dwQtgSucMU40qmeer4Nz_j16AgyTP4bVU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="antialiased">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
