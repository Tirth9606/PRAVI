import {
  getAssignedProjects,
  getAssignedRoads,
  getMyConstructionInspections,
  getMyRoadInspections,
} from "@/features/inspector/queries";
import { getDict } from "@/lib/i18n/server";
import { ConstructionInspectionForm, RoadInspectionForm } from "@/features/inspector/inspector-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Inspections" };
export const dynamic = "force-dynamic";

export default async function InspectorInspectionsPage() {
  const { dict } = await getDict();
  const [projects, roads, cInsp, rInsp] = await Promise.all([
    getAssignedProjects(),
    getAssignedRoads(),
    getMyConstructionInspections(),
    getMyRoadInspections(),
  ]);

  const tabs = [
    {
      key: "construction",
      label: dict.tabs.construction,
      content: (
        <Card><CardContent className="pt-5"><ConstructionInspectionForm projects={projects} /></CardContent></Card>
      ),
    },
    {
      key: "road",
      label: dict.nav.roads,
      content: (
        <Card><CardContent className="pt-5"><RoadInspectionForm roads={roads} /></CardContent></Card>
      ),
    },
    {
      key: "history",
      label: dict.tabs.history,
      badge: cInsp.length + rInsp.length,
      content: (
        <Card><CardContent className="pt-5">
          {cInsp.length + rInsp.length === 0 ? (
            <EmptyState title={dict.common.noResults} />
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>{dict.fields.type}</TableHead>
                <TableHead>{dict.fields.date}</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>{dict.common.status}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {cInsp.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{dict.tabs.construction}</TableCell>
                    <TableCell>{formatDate(i.inspection_date)}</TableCell>
                    <TableCell className="text-muted-foreground">{i.progress_percentage}% · <StatusBadge value={i.quality_status} /></TableCell>
                    <TableCell><StatusBadge value={i.status} /></TableCell>
                  </TableRow>
                ))}
                {rInsp.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{dict.nav.roads}</TableCell>
                    <TableCell>{formatDate(i.inspection_date)}</TableCell>
                    <TableCell className="text-muted-foreground"><StatusBadge value={i.condition} /></TableCell>
                    <TableCell><StatusBadge value={i.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent></Card>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.inspections} description="Submit inspections for your assigned projects and roads." />
      <Tabs tabs={tabs} />
    </div>
  );
}
