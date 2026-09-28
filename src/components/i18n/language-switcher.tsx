"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { setLocale } from "@/lib/i18n/actions";
import { LOCALES, getDictionary, type Locale } from "@/locales";
import { useI18n } from "./i18n-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale } = useI18n();
  const [pending, startTransition] = useTransition();

  return (
    <label className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <Languages className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">Language</span>
      <select
        aria-label="Select language"
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Locale;
          startTransition(() => {
            void setLocale(next);
          });
        }}
        className="rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {getDictionary(l).meta.name}
          </option>
        ))}
      </select>
    </label>
  );
}
