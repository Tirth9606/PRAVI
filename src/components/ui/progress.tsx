import { cn } from "@/lib/utils";
import { clampPercent } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  label,
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const pct = clampPercent(value);
  const tone = pct >= 100 ? "bg-success" : pct >= 50 ? "bg-info" : pct > 0 ? "bg-warning" : "bg-muted-foreground/40";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
