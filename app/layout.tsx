import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRE Knowledge Graph AI",
  description: "A portfolio demo for CRE ontology, temporal modeling, extraction, and graph reasoning."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

