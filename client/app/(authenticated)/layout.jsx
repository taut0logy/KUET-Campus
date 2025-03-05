"use client";

import { Header } from "@/components/layout/header";
import { Protected } from "@/components/ui/protected";
import { Sidebar } from "@/components/layout/sidebar";

/**
 * Authenticated Layout
 * This layout focuses solely on:
 * 1. Providing the authenticated layout structure
 * 2. Using the Protected component for auth checks
 */
export function AuthenticatedLayout({ children }) {
  return (
    <Protected redirectTo="/login" requireEmailVerified={true}>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-6 mx-auto px-4">{children}</div>
        </main>
      </div>
    </Protected>
  );
} 

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
