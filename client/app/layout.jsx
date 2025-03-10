import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import ThemeProvider from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import Footer from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "KUET Campus",
  description: "A complete campus management system for KUET",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <AuthProvider>
              <SocketProvider>
                <div className="flex min-h-screen flex-col">
                  <main className="flex-1">{children}</main>
                </div>
                <Toaster richColors closeButton />
              </SocketProvider>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
