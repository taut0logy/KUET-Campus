"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import useAuthStore from "@/stores/auth-store";

const getRoutes = (user) => {
  const isAdmin = user?.roles?.includes('admin');
  const isManager = user?.roles?.includes('manager');
  const isStaff = isAdmin || isManager;

  if (isAdmin) {
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        requireAuth: true,
      },
      {
        href: "/admin/staff",
        label: "Staff Management",
        requireAuth: true,
      },
      {
        href: "/admin/users",
        label: "User Management",
        requireAuth: true,
      },
      {
        href: "/campaigns/manage",
        label: "Manage Campaigns",
        requireAuth: true,
      },
      {
        href: "/contact-messages",
        label: "Contact Messages",
        requireAuth: true,
      },
      {
        href: "/dashboard/analytics",
        label: "Analytics",
        requireAuth: true,
      },
    ];
  }

  if (isManager) {
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        requireAuth: true,
      },
      {
        href: "/manager/users",
        label: "User Management",
        requireAuth: true,
      },
      {
        href: "/campaigns/manage",
        label: "Manage Campaigns",
        requireAuth: true,
      },
      {
        href: "contact-messages",
        label: "Contact Messages",
        requireAuth: true,
      },
      {
        href: "/dashboard/analytics",
        label: "Analytics",
        requireAuth: true,
      },
    ];
  }

  // Regular user routes
  return [
    {
      href: "/dashboard",
      label: "Dashboard",
      requireAuth: true,
    },
    {
      href: "/notices",
      label: "Notices & Announcements",
      requireAuth: true,
    },
    {
      href: "/bus",
      label: "Bus Schedule",
      requireAuth: true,
    },

    {
      href: "/cafeteria",
      label: "Cafeteria",
      requireAuth: true,
    },

    {
      href: "/cart",
      label: "Cart",
      requireAuth: true,
    },
    {
      href: "/preorder",
      label: "Preorder",
      requireAuth: true,
    },
  ];
};

export function MainNav() {
  const pathname = usePathname();
  const user = useAuthStore(state => state.user);
  const routes = getRoutes(user);

  return (
    <nav className="hidden lg:flex items-center space-x-4 lg:space-x-6">
      {routes
        .filter((route) => !route.requireAuth || user)
        .map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === route.href
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {route.label}
          </Link>
        ))}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const user = useAuthStore(state => state.user);
  const routes = getRoutes(user);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader className="space-y-1 py-6 text-start">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Choose an option from the menu below.
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col space-y-3">
          {routes
            .filter((route) => !route.requireAuth || user)
            .map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {route.label}
              </Link>
            ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
} 