"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/action-helpers";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Fire a one-argument server action (e.g. a lifecycle transition) with a
 * confirmation, surfacing any error message inline.
 */
export function ActionButton({
  action,
  children,
  confirm,
  variant,
  size,
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  confirm?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          setError(null);
          startTransition(async () => {
            const res = await action();
            if (!res.ok) setError(res.message ?? "Action failed.");
            else router.refresh();
          });
        }}
      >
        {children}
      </Button>
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
