import Link from "next/link";
import { listRoads, getRoadWards } from "@/features/roads/queries";
import { RoadFilters } from "@/features/roads/road-filters";
import { RoadForm } from "@/features/roads/road-forms";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Roads" };
export const dynamic = "force-dynamic";

export default async function RoadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { dict } = await getDict();
  const [{ rows, total, page, pageSize }, wards] = await Promise.all([
    listRoads({
      condition: sp.condition,
      priority: sp.priority,
      ward: sp.ward,
      status: sp.status,
      search: sp.search,
      page: sp.page ? Number(sp.page) : 1,
    }),
    getRoadWards(),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.roads} description="Operational roads under management." actions={<RoadForm />} />
      <RoadFilters wards={wards} />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title={dict.common.noResults} description="Roads appear here after project handover or manual registration." />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Road Code</TableHead>
                  <TableHead>{dict.fields.roadName}</TableHead>
                  <TableHead>{dict.fields.ward}</TableHead>
                  <TableHead>{dict.fields.condition}</TableHead>
                  <TableHead>{dict.fields.priority}</TableHead>
                  <TableHead>{dict.fields.lastInspection}</TableHead>
                  <TableHead className="text-right">{dict.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.road_code}</TableCell>
                    <TableCell>{r.road_name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.ward}</TableCell>
                    <TableCell><StatusBadge value={r.current_condition} /></TableCell>
                    <TableCell><StatusBadge value={r.priority} /></TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(r.last_inspection_date)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/officer/roads/${r.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        {dict.common.view}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-2">
              <Pagination page={page} pageSize={pageSize} total={total} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
