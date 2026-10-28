import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brand } from "@/lib/site-content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://decucare.bg"),
  title: {
    default: `${brand.name} — Регенериращ и възстановяващ крем 150 мл`,
    template: `%s · ${brand.name}`,
  },
  description:
    "DECUCARE е високоефективен регенериращ и възстановяващ крем за чувствителна, раздразнена или увредена кожа. Хидратация, регенерация и защита — направен ръчно в България.",
  keywords: [
    "регенериращ крем",
    "възстановяващ крем",
    "крем за чувствителна кожа",
    "натурална козметика България",
    "DecuCare",
  ],
  openGraph: {
    title: `${brand.name} — Регенериращ и възстановяващ крем 150 мл`,
    description:
      "Натурални екстракти и активни съставки, действащи синергично за успокояване и възстановяване на кожата. Направен ръчно в България.",
    type: "website",
    locale: "bg_BG",
    images: ["/images/hero-cream.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bg">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Jost:wght@200;300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
