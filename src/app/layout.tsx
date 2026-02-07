import "./globals.css";
import localFont from "next/font/local";

const gambarino = localFont({
  src: "./fonts/Gambarino-Regular.otf",
  variable: "--font-gambarino",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={gambarino.variable}>
      <body>{children}</body>
    </html>
  );
}