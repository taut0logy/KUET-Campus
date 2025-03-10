"use client";

import GuestHeader from "@/components/layout/guest-header";
import Footer from "@/components/layout/footer";
export default function GuestLayout({ children }) {

  return (
    <div className="flex flex-col min-h-screen">
      <GuestHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
