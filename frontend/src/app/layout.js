import { Barlow_Condensed, Public_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

// Each page sets its own title with a <title> tag, so there is no default title here.
export const metadata = {
  description:
    "Upload one selfie. StyleScan AI measures your face shape and shows you the haircuts and glasses that fit.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${publicSans.variable} ${barlow.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}