"use client";

import { Header } from "@/components/layout/header";
import { Protected } from "@/components/ui/protected";
import CafeAiAssistant from "@/components/CafeAiAssistant";
import useAuthStore from "@/stores/auth-store";

/**
 * Authenticated Layout
 * This layout focuses solely on:
 * 1. Providing the authenticated layout structure
 * 2. Using the Protected component for auth checks
 */
export default function AuthenticatedLayout({ children }) {
  const { user } = useAuthStore();
  const isCafeManager = user?.roles?.includes('CAFE_MANAGER');

  return (
    <Protected redirectTo="/login" requireEmailVerified={true}>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-6 mx-auto px-4">{children}</div>
        </main>
        
        {/* Render AI Assistant only for cafe managers */}
        {isCafeManager && <CafeAiAssistant />}
      </div>
    </Protected>
  );
}