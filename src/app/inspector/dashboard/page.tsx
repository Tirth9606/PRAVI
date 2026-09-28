import { FolderKanban, Route, ClipboardCheck, TriangleAlert, Clock } from "lucide-react";
import { getInspectorDashboard } from "@/features/inspector/queries";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Inspector Dashboard" };
export const dynamic = "force-dynamic";

export default async function InspectorDashboardPage() {
  const { dict } = await getDict();
  const d = await getInspectorDashboard();

  return (
    <div className="space-y-6">
      <PageHeader title={dict.nav.dashboard} description="Your assigned work and recent submissions." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label={dict.dashboard.assignedProjects} value={d.assignedProjects} icon={FolderKanban} href="/inspector/projects" />
        <StatCard label={dict.dashboard.assignedRoads} value={d.assignedRoads} icon={Route} href="/inspector/roads" />
        <StatCard label={dict.dashboard.pendingInspections} value={d.pendingInspections} icon={Clock} tone="warning" href="/inspector/inspections" />
        <StatCard label={dict.dashboard.recentInspections} value={d.recentInspections.length} icon={ClipboardCheck} tone="info" />
        <StatCard label={dict.dashboard.openDefects} value={d.openDefects} icon={TriangleAlert} tone="destructive" href="/inspector/defects" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.dashboard.recentInspections}</CardTitle>
        </CardHeader>
        <CardContent>
          {d.recentInspections.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title={dict.common.noResults} description="Submit an inspection from the Inspections page." />
          ) : (
            <ul className="divide-y divide-border">
              {d.recentInspections.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{formatDate(i.inspection_date)}</span>
                  <StatusBadge value={i.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
