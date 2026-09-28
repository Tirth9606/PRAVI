"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";

export function UserMenu({ name, roleLabel }: { name: string; roleLabel: string }) {
  const { dict } = useI18n();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-tight">{name}</p>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => void signOutAction())}
      >
        <LogOut className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{dict.nav.signOut}</span>
      </Button>
    </div>
  );
}
