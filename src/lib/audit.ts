import "server-only";

/**
 * Append-only audit logging (spec §21). Writes are best-effort: a failure to log
 * must never crash a legitimate mutation, but is surfaced to the server console.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuditAction } from "@/lib/domain/enums";

export interface AuditEntry {
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("audit_logs").insert({
      user_id: entry.userId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      old_value: entry.oldValue ?? null,
      new_value: entry.newValue ?? null,
      ip_address: entry.ipAddress ?? null,
    });
    if (error) {
      console.error("[audit] failed to record", entry.action, error.message);
    }
  } catch (err) {
    console.error("[audit] unexpected error", err);
  }
}
