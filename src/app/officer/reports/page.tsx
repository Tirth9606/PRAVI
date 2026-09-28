import { Download, FileText } from "lucide-react";
import { getReportSummary, REPORT_TYPES } from "@/features/reports/queries";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { dict } = await getDict();
  const summary = await getReportSummary();

  return (
    <div className="space-y-6">
      <PageHeader title={dict.nav.reports} description="Operational reports from live data, exportable as CSV." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={dict.nav.projects} value={summary.projects} />
        <StatCard label={dict.nav.roads} value={summary.roads} />
        <StatCard label={dict.nav.maintenance} value={summary.maintenance} />
        <StatCard label={dict.nav.inspections} value={summary.inspections} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available reports</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPES.map((r) => (
            <div key={r.type} className="flex items-center justify-between gap-3 rounded-md border border-border p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
                <span className="text-sm font-medium">{r.title}</span>
              </div>
              <a
                href={`/officer/reports/export?type=${r.type}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
                download
              >
                <Download className="h-4 w-4" /> {dict.common.export}
              </a>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-xs italic text-muted-foreground">PDF export is planned; CSV is provided in this MVP.</p>
    </div>
  );
}
