import type { Metadata } from "next";
import "@fontsource/instrument-serif/400.css";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ComEat",
    template: "%s | ComEat",
  },
  description: "Authentic Nigerian food, made to bring people together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
