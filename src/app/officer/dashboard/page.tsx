import Link from "next/link";
import {
  FolderKanban,
  HardHat,
  CheckCircle2,
  TriangleAlert,
  CheckSquare,
  Wrench,
} from "lucide-react";
import { getOfficerDashboard } from "@/features/dashboard/queries";
import { getDict } from "@/lib/i18n/server";
import { enumLabel } from "@/locales/enum-labels";
import { PROJECT_STATUSES } from "@/lib/domain/enums";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatINR, formatNumber } from "@/lib/utils";

export const metadata = { title: "Officer Dashboard" };
export const dynamic = "force-dynamic";

export default async function OfficerDashboardPage() {
  const { locale, dict } = await getDict();
  const d = await getOfficerDashboard();
  const maxPipeline = Math.max(1, ...d.pipeline.map((p) => p.count));
  const totalRoads = Math.max(1, d.roadConditions.reduce((s, r) => s + r.count, 0));

  return (
    <div className="space-y-6">
      <PageHeader title={dict.nav.dashboard} description={dict.app.tagline} />

      {/* KPI cards — every metric comes from a DB query (spec §26) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label={dict.dashboard.activeProjects} value={d.kpis.activeProjects} icon={FolderKanban} href="/officer/projects" />
        <StatCard label={dict.dashboard.underConstruction} value={d.kpis.underConstruction} icon={HardHat} tone="info" href="/officer/construction" />
        <StatCard label={dict.dashboard.completed} value={d.kpis.completed} icon={CheckCircle2} tone="success" />
        <StatCard label={dict.dashboard.criticalRoads} value={d.kpis.criticalRoads} icon={TriangleAlert} tone="destructive" href="/officer/roads" />
        <StatCard label={dict.dashboard.pendingApprovals} value={d.kpis.pendingApprovals} icon={CheckSquare} tone="warning" href="/officer/approvals" />
        <StatCard label={dict.dashboard.pendingMaintenance} value={d.kpis.pendingMaintenance} icon={Wrench} tone="warning" href="/officer/maintenance" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>{dict.dashboard.projectPipeline}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.pipeline.length === 0 ? (
              <EmptyState title={dict.common.noResults} />
            ) : (
              PROJECT_STATUSES.filter((s) => d.pipeline.some((p) => p.status === s)).map((status) => {
                const item = d.pipeline.find((p) => p.status === status)!;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-xs text-muted-foreground">{enumLabel(status, locale)}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / maxPipeline) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-sm font-medium tabular-nums">{item.count}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Road condition overview */}
        <Card>
          <CardHeader>
            <CardTitle>{dict.dashboard.roadCondition}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.roadConditions.map((rc) => (
              <div key={rc.condition} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs">
                  <StatusBadge value={rc.condition} />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={
                      "h-full rounded-full " +
                      (rc.condition === "CRITICAL"
                        ? "bg-destructive"
                        : rc.condition === "POOR"
                          ? "bg-warning"
                          : rc.condition === "MODERATE"
                            ? "bg-info"
                            : "bg-success")
                    }
                    style={{ width: `${(rc.count / totalRoads) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-medium tabular-nums">{rc.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Attention required */}
      <Card>
        <CardHeader>
          <CardTitle>{dict.dashboard.attentionRequired}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {dict.dashboard.criticalRoads}
            </p>
            {d.attention.criticalRoads.length === 0 ? (
              <p className="text-sm text-muted-foreground">{dict.common.noResults}</p>
            ) : (
              <ul className="space-y-1.5">
                {d.attention.criticalRoads.map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-sm">
                    <Link href={`/officer/roads/${r.id}`} className="font-medium hover:underline">
                      {r.road_code} — {r.road_name}
                    </Link>
                    <span className="text-muted-foreground">{r.ward}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {dict.dashboard.pendingMaintenance}
            </p>
            {d.attention.pendingMaintenance.length === 0 ? (
              <p className="text-sm text-muted-foreground">{dict.common.noResults}</p>
            ) : (
              <ul className="space-y-1.5">
                {d.attention.pendingMaintenance.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{m.work_type}</span>
                    <StatusBadge value={m.priority} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Impact / outcome summary */}
      <Card>
        <CardHeader>
          <CardTitle>{dict.dashboard.impactSummary}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric label={dict.dashboard.totalExpenditure} value={formatINR(d.impact.totalExpenditure, { compact: true })} />
          <Metric label={dict.dashboard.roadsMaintained} value={formatNumber(d.impact.roadsManaged)} />
          <Metric label={dict.dashboard.underConstruction + " (km)"} value={formatNumber(d.impact.lengthUnderConstructionKm, 1)} />
          <Metric label={dict.dashboard.completed} value={formatNumber(d.impact.completedProjects)} />
          <p className="col-span-full text-xs italic text-muted-foreground">* {dict.common.estimatedNote}.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
