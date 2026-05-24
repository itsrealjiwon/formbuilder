import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen crt-flicker">
        <div className="crt-overlay"></div>
        {children}
      </body>
    </html>
  );
}
