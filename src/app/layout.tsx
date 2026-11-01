import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
// Mesma identidade das páginas dos vídeos: o estilo.css delas é a base, a loja é uma camada por cima
import "../../public/assets/estilo.css";
import "../../public/assets/catalogo.css";
import "./globals.css";
import { PixelMeta } from "@/components/PixelMeta";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--fonte-display" });
const corpo = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--fonte-corpo" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--fonte-mono" });

export const metadata: Metadata = {
  title: { default: "Pacotes de skills e agentes", template: "%s | Leonardo Araujo" },
  description: "Skills e times de agentes para Claude Code e Codex, com guia em português, prompts prontos e aula curta.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable} ${mono.variable}`}>
      <body>
        {children}
        <PixelMeta />
      </body>
    </html>
  );
}
