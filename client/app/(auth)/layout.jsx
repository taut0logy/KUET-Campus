"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icons } from "@/components/ui/icons";

/**
 * Auth Layout
 * This layout is for unauthenticated routes (login, register, etc.)
 * It provides a simple header and container for auth forms
 * Redirects are primarily handled by middleware
 */
export default function AuthLayout({ children }) {
  const [loading, setLoading] = useState(true);
  
  // Simple effect to show layout after a brief loading period
  useEffect(() => {
    // Set a small timeout to prevent layout flash
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center mx-auto px-4">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">KUET Campus</span>
            </Link>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <nav className="flex items-center space-x-2">
                <ThemeToggle />
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 container mx-auto">
          <div className="text-center">
            <Icons.spinner className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Render auth pages 
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center mx-auto px-4">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">KUET Campus</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-10 px-4 container mx-auto">
        {children}
      </main>
    </div>
  );
}
