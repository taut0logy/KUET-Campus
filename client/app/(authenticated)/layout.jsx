"use client";

import { Header } from "@/components/layout/header";
import { Protected } from "@/components/ui/protected";
import AIAssistant from "@/components/AiAgent";

/**
 * Authenticated Layout
 * This layout focuses solely on:
 * 1. Providing the authenticated layout structure
 * 2. Using the Protected component for auth checks
 */
export default function AuthenticatedLayout({ children }) {

  return (
    <Protected redirectTo="/login" requireEmailVerified={true}>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4">{children}</div>
        </main>
        
          <AIAssistant />
      </div>
    </Protected>
  );
}