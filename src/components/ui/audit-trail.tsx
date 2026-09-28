"use client";

import { useI18n } from "@/components/i18n/i18n-provider";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog } from "@/types/models";
import { EmptyState } from "./states";
import { ScrollText } from "lucide-react";

export function AuditTrail({ rows, userNames }: { rows: AuditLog[]; userNames?: Record<string, string> }) {
  const { dict, label } = useI18n();
  if (rows.length === 0) {
    return <EmptyState icon={ScrollText} title={dict.common.noResults} />;
  }
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {rows.map((r) => (
        <li key={r.id} className="relative">
          <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-medium">{label(r.action)}</span>
            <span className="text-xs text-muted-foreground">{r.entity_type}</span>
            <span className="text-xs text-muted-foreground">· {formatDateTime(r.timestamp)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {r.user_id ? (userNames?.[r.user_id] ?? r.user_id) : "system"}
            {r.new_value ? ` — ${JSON.stringify(r.new_value)}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
