import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./../components/session-wrapper";
import { ThemeProvider } from "next-themes";
import 'leaflet/dist/leaflet.css';


const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Trade Minutes",
  description: "Trade Minutes",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${urbanist.variable} font-urbanist antialiased`}
      >
        <SessionWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
