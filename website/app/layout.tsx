import type { Metadata } from "next";
import { Doto, Outfit, Montserrat } from "next/font/google";
import "./globals.css";

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "LICON — LinkedIn Connector Toolkit",
  description:
    "Automate LinkedIn connections, engagement, and profile visits. Grow your professional network on autopilot with LICON.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${doto.variable} ${outfit.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
