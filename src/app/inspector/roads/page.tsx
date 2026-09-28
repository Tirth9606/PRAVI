import { getAssignedRoads } from "@/features/inspector/queries";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Assigned Roads" };
export const dynamic = "force-dynamic";

export default async function InspectorRoadsPage() {
  const { dict } = await getDict();
  const rows = await getAssignedRoads();

  return (
    <div className="space-y-4">
      <PageHeader title={dict.dashboard.assignedRoads} description="Roads you are assigned to inspect." />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title={dict.common.noResults} description="An officer must assign you to a road before you can inspect it." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Road Code</TableHead>
                <TableHead>{dict.fields.roadName}</TableHead>
                <TableHead>{dict.fields.ward}</TableHead>
                <TableHead>{dict.fields.condition}</TableHead>
                <TableHead>{dict.fields.lastInspection}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.road_code}</TableCell>
                  <TableCell>{r.road_name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.ward}</TableCell>
                  <TableCell><StatusBadge value={r.current_condition} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(r.last_inspection_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
