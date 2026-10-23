import "./globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: { default: "StyleScan AI", template: "%s" },
  description:
    "Photo tools that run in your browser: edit, sharpen, blur backgrounds, find your face shape and track your skin. Your photos stay private.",
  icons: { icon: "/logo.svg" },
};

// The colour of the phone's top bar follows the theme
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3f0" },
    { media: "(prefers-color-scheme: dark)", color: "#111110" },
  ],
};

// Runs before the page is drawn, so a saved Light or Dark choice shows with no flash
const themeScript = `try{var t=localStorage.getItem("stylescan-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}