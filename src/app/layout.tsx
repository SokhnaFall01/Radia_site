import type { Metadata } from "next";
import { Marcellus, Cormorant_Garamond, Jost } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "./globals.css";

const marcellus = Marcellus({
  variable: "--font-marcellus",
  weight: "400",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  style: ["italic"],
  weight: "400",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radia Glam Beauty & Co.",
  description: "Salon, academy et boutique de maquillage a Dakar, Senegal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${marcellus.variable} ${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
