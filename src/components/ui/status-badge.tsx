"use client";

import { Badge, type BadgeProps } from "./badge";
import { useI18n } from "@/components/i18n/i18n-provider";

type Variant = NonNullable<BadgeProps["variant"]>;

/** Map a canonical enum value to a semantic badge variant. Never color-only:
 *  the localized text label always carries the meaning too (spec §33). */
const VARIANT_BY_VALUE: Record<string, Variant> = {
  // Positive / complete
  APPROVED: "success",
  BUDGET_APPROVED: "success",
  COMPLETED: "success",
  HANDED_OVER: "success",
  ACTIVE: "success",
  OPERATIONAL: "success",
  GOOD: "success",
  AWARDED: "success",
  ACCEPTED: "success",
  VERIFIED: "success",
  RESOLVED: "success",
  SATISFACTORY: "success",
  LOW: "success",
  // In-progress / informational
  SUBMITTED: "info",
  UNDER_REVIEW: "info",
  TENDERING: "info",
  CONTRACTOR_SELECTED: "info",
  WORK_ORDER_ISSUED: "info",
  UNDER_CONSTRUCTION: "info",
  OPEN: "info",
  EVALUATION: "info",
  IN_PROGRESS: "info",
  SCHEDULED: "info",
  REVIEWED: "info",
  MEDIUM: "info",
  // Caution
  PENDING: "warning",
  MODERATE: "warning",
  HIGH: "warning",
  NEEDS_ATTENTION: "warning",
  ACTION_REQUIRED: "warning",
  UNDER_MAINTENANCE: "warning",
  CLOSED: "neutral",
  DRAFT: "neutral",
  INACTIVE: "neutral",
  // Negative / critical
  CRITICAL: "destructive",
  POOR: "destructive",
  REJECTED: "destructive",
  CANCELLED: "destructive",
  TERMINATED: "destructive",
  BLACKLISTED: "destructive",
  UNSATISFACTORY: "destructive",
};

export function StatusBadge({ value, className }: { value: string | null | undefined; className?: string }) {
  const { label } = useI18n();
  if (!value) return <span className="text-muted-foreground">—</span>;
  const variant = VARIANT_BY_VALUE[value] ?? "neutral";
  return (
    <Badge variant={variant} className={className}>
      {label(value)}
    </Badge>
  );
}
