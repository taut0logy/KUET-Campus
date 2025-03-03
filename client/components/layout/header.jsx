"use client";

import Link from "next/link";
import { MainNav, MobileNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4">
        <MobileNav />
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">KUET Campus</span>
        </Link>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <NotificationPopover />
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
} 