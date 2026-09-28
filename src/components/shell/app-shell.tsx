"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import type { UserRole } from "@/lib/domain/enums";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppShell({
  role,
  name,
  roleLabel,
  home,
  children,
}: {
  role: UserRole;
  name: string;
  roleLabel: string;
  home: string;
  children: React.ReactNode;
}) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <Brand home={home} name={dict.app.name} />
        <div className="flex-1 overflow-y-auto">
          <SidebarNav role={role} />
        </div>
        <p className="border-t border-border p-3 text-[11px] leading-tight text-muted-foreground">
          {dict.app.disclaimer}
        </p>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-3">
              <Brand home={home} name={dict.app.name} />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav role={role} onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-muted-foreground lg:hidden">{dict.app.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <UserMenu name={name} roleLabel={roleLabel} />
          </div>
        </header>

        <main id="main-content" className={cn("flex-1 space-y-6 p-4 sm:p-6")}>
          {children}
        </main>
      </div>
    </div>
  );
}

function Brand({ home, name }: { home: string; name: string }) {
  return (
    <Link href={home} className="flex items-center gap-2 p-4 font-semibold">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Building2 className="h-5 w-5" aria-hidden />
      </span>
      <span className="tracking-tight">{name}</span>
    </Link>
  );
}
