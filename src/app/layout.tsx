import type { Metadata } from "next";
import { Share_Tech_Mono, VT323 } from "next/font/google";
import "./globals.css";

const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt323" });
const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: "400", variable: "--font-share-tech-mono" });

export const metadata: Metadata = {
  title: "FormBuilder — CRT Form Generator",
  description: "Drag & drop form builder with retro terminal aesthetics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${vt323.variable} ${shareTechMono.variable}`}>
      <body className="antialiased min-h-screen crt-flicker">
        <div className="crt-overlay"></div>
        {children}
      </body>
    </html>
  );
}
