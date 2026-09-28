"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Select } from "@/components/ui/select";

export function AuditLogFilter({ actions }: { actions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { dict, label } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Filter by action"
        value={params.get("action") ?? ""}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value) next.set("action", e.target.value);
          else next.delete("action");
          next.delete("page");
          router.push(`${pathname}?${next.toString()}`);
        }}
        className="w-auto"
      >
        <option value="">{dict.common.actions}: {dict.common.all}</option>
        {actions.map((a) => (
          <option key={a} value={a}>
            {label(a)}
          </option>
        ))}
      </Select>
    </div>
  );
}
