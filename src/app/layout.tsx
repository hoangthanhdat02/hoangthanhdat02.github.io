import type { Metadata, Viewport } from "next";
import { Inter, Dancing_Script, Playfair_Display, Fredoka, Titan_One } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const titanOne = Titan_One({
  variable: "--font-titan",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#05020a",
};

export const metadata: Metadata = {
  title: "Happy Birthday My Love 💖 | Món Quà Yêu Thương",
  description: "Trải nghiệm chúc mừng sinh nhật 3D cá nhân hóa với hiệu ứng chữ hạt bụi sao, bánh kem 3D rơi từng tầng và quả cầu trái tim tương tác.",
  openGraph: {
    title: "Happy Birthday My Love 💖",
    description: "Một món quà sinh nhật số hóa 3D đong đầy tình cảm.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${dancingScript.variable} ${playfair.variable} ${fredoka.variable} ${titanOne.variable} h-full dark`}
    >
      <body className="h-full w-full bg-[#05020a] text-pink-50 overflow-hidden select-none antialiased">
        {children}
      </body>
    </html>
  );
}
