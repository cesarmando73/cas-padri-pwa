import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cas Padrí - Menú Digital",
  description: "Disfruta de la mejor experiencia gastronómica en Cas Padrí con nuestro menú digital interactivo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-primary/30 selection:text-primary">
        <div className="mx-auto min-h-screen max-w-md bg-background shadow-2xl ring-1 ring-white/10">
          {children}
        </div>
      </body>
    </html>
  );
}
