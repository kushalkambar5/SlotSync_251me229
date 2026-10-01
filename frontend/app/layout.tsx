import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SlotSync | Campus Infrastructure Booking Platform",
  description:
    "Your Campus Spaces, Just a Few Clicks Away. Live availability, instant booking requests, and conflict-free facility management for classrooms, seminar halls, and labs at NITK.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased scroll-smooth`}>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#1F1F1F] selection:bg-[#EF2B4D] selection:text-white">
        {children}
      </body>
    </html>
  );
}
