"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { ROAD_CONDITIONS, PRIORITIES, ROAD_STATUSES } from "@/lib/domain/enums";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function RoadFilters({ wards }: { wards: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { dict, label } = useI18n();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  const hasFilters = ["condition", "priority", "ward", "status", "search"].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          aria-label={dict.common.search}
          placeholder={`${dict.common.search}…`}
          defaultValue={params.get("search") ?? ""}
          className="pl-8"
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("search", (e.target as HTMLInputElement).value);
          }}
        />
      </div>
      <Select aria-label={dict.fields.condition} value={params.get("condition") ?? ""} onChange={(e) => setParam("condition", e.target.value)} className="w-auto">
        <option value="">{dict.fields.condition}: {dict.common.all}</option>
        {ROAD_CONDITIONS.map((c) => <option key={c} value={c}>{label(c)}</option>)}
      </Select>
      <Select aria-label={dict.fields.priority} value={params.get("priority") ?? ""} onChange={(e) => setParam("priority", e.target.value)} className="w-auto">
        <option value="">{dict.fields.priority}: {dict.common.all}</option>
        {PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}
      </Select>
      <Select aria-label={dict.common.status} value={params.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)} className="w-auto">
        <option value="">{dict.common.status}: {dict.common.all}</option>
        {ROAD_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
      </Select>
      <Select aria-label={dict.fields.ward} value={params.get("ward") ?? ""} onChange={(e) => setParam("ward", e.target.value)} className="w-auto">
        <option value="">{dict.fields.ward}: {dict.common.all}</option>
        {wards.map((w) => <option key={w} value={w}>{w}</option>)}
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          <X className="h-4 w-4" /> {dict.common.reset}
        </Button>
      )}
    </div>
  );
}
