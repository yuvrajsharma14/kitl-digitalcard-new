"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LayoutTemplate,
  LifeBuoy,
  Settings,
  LogOut,
  Menu,
  QrCode,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/admin",           label: "Dashboard",       icon: LayoutDashboard },
  { href: "/admin/users",     label: "Users",           icon: Users },
  { href: "/admin/cards",     label: "Cards",           icon: CreditCard },
  { href: "/admin/templates", label: "Templates",       icon: LayoutTemplate },
  { href: "/admin/support",   label: "Support Tickets", icon: LifeBuoy },
];

function NavItem({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <QrCode className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">My Digital Card</p>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} onClick={onNavClick} />
        ))}
      </nav>

      <Separator className="bg-white/10" />

      {/* Bottom actions */}
      <div className="px-3 py-4 space-y-1">
        <NavItem
          href="/admin/settings"
          label="Settings"
          icon={Settings}
          onClick={onNavClick}
        />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 bg-gray-900 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar trigger */}
      <div className="flex items-center lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2 mt-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 bg-gray-900 p-0 border-0">
            <SidebarContent onNavClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
