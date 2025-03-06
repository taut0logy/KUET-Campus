import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import ThemeProvider from "@/components/providers/theme-provider";
import QueryProvider from "@/components/providers/query-provider";
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
          {/* <QueryProvider> */}
            <AuthProvider>
              <SocketProvider>
                <div className="flex min-h-screen flex-col">
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <Toaster richColors closeButton />
              </SocketProvider>
            </AuthProvider>
          {/* </QueryProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
