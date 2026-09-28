"use client";

import { Check, Circle, XCircle } from "lucide-react";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/domain/enums";
import { useI18n } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/utils";

// The linear "happy path" of the project lifecycle (excludes CANCELLED).
const LINEAR: ProjectStatus[] = PROJECT_STATUSES.filter((s) => s !== "CANCELLED");

export function LifecycleTimeline({ status }: { status: ProjectStatus }) {
  const { label } = useI18n();
  const cancelled = status === "CANCELLED";
  const currentIndex = LINEAR.indexOf(status);

  return (
    <ol className="space-y-2">
      {LINEAR.map((s, i) => {
        const done = !cancelled && i < currentIndex;
        const current = !cancelled && i === currentIndex;
        return (
          <li key={s} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border",
                done && "border-success bg-success text-success-foreground",
                current && "border-primary bg-primary text-primary-foreground",
                !done && !current && "border-border text-muted-foreground",
              )}
              aria-hidden
            >
              {done ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2 fill-current" />}
            </span>
            <span
              className={cn(
                "text-sm",
                current ? "font-semibold text-foreground" : done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label(s)}
            </span>
          </li>
        );
      })}
      {cancelled && (
        <li className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-destructive bg-destructive text-destructive-foreground" aria-hidden>
            <XCircle className="h-3 w-3" />
          </span>
          <span className="text-sm font-semibold text-destructive">{label("CANCELLED")}</span>
        </li>
      )}
    </ol>
  );
}
