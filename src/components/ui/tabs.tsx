"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabDef {
  key: string;
  label: string;
  content: React.ReactNode;
  badge?: number;
}

export function Tabs({ tabs, initial }: { tabs: TabDef[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.key);

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Sections" className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => {
          const selected = t.key === active;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.key)}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" hidden={t.key !== active}>
          {t.key === active && t.content}
        </div>
      ))}
    </div>
  );
}
