import { getAssignedRoads, getVisibleDefects } from "@/features/inspector/queries";
import { getDict } from "@/lib/i18n/server";
import { enumLabel } from "@/locales/enum-labels";
import { InspectorDefectForm } from "@/features/inspector/inspector-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Defects" };
export const dynamic = "force-dynamic";

export default async function InspectorDefectsPage() {
  const { locale, dict } = await getDict();
  const [roads, defects] = await Promise.all([getAssignedRoads(), getVisibleDefects()]);

  return (
    <div className="space-y-6">
      <PageHeader title={dict.nav.defects} description="Report and track defects on your assigned roads." />

      <Card>
        <CardHeader><CardTitle>Report a defect</CardTitle></CardHeader>
        <CardContent><InspectorDefectForm roads={roads} /></CardContent>
      </Card>

      <Card className="p-2">
        {defects.length === 0 ? (
          <div className="p-6"><EmptyState title={dict.common.noResults} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.fields.type}</TableHead>
                <TableHead>{dict.fields.severity}</TableHead>
                <TableHead className="text-right">{dict.fields.quantity}</TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead>{dict.fields.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defects.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{enumLabel(d.type, locale)}</TableCell>
                  <TableCell><StatusBadge value={d.severity} /></TableCell>
                  <TableCell className="text-right tabular-nums">{d.quantity}</TableCell>
                  <TableCell><StatusBadge value={d.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(d.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
