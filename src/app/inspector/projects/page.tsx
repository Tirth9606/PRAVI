import { getAssignedProjects } from "@/features/inspector/queries";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";

export const metadata = { title: "Assigned Projects" };
export const dynamic = "force-dynamic";

export default async function InspectorProjectsPage() {
  const { dict } = await getDict();
  const rows = await getAssignedProjects();

  return (
    <div className="space-y-4">
      <PageHeader title={dict.dashboard.assignedProjects} description="Projects you are assigned to inspect." />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title={dict.common.noResults} description="An officer must assign you to a project before you can inspect it." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.fields.projectCode}</TableHead>
                <TableHead>{dict.fields.road}</TableHead>
                <TableHead>{dict.fields.ward}</TableHead>
                <TableHead>{dict.common.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.project_code}</TableCell>
                  <TableCell>{p.road_name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.ward}</TableCell>
                  <TableCell><StatusBadge value={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
