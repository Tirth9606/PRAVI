import Link from "next/link";
import { Plus } from "lucide-react";
import { listProjects, getProjectWards, getLatestProgress } from "@/features/projects/queries";
import { ProjectFilters } from "@/features/projects/project-filters";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { dict } = await getDict();
  const [{ rows, total, page, pageSize }, wards] = await Promise.all([
    listProjects({
      status: sp.status,
      ward: sp.ward,
      roadType: sp.roadType,
      search: sp.search,
      page: sp.page ? Number(sp.page) : 1,
    }),
    getProjectWards(),
  ]);
  const progress = await getLatestProgress(rows.map((r) => r.id));

  return (
    <div className="space-y-4">
      <PageHeader
        title={dict.nav.projects}
        description={dict.app.tagline}
        actions={
          <Link href="/officer/projects/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" /> {dict.common.create}
          </Link>
        }
      />

      <ProjectFilters wards={wards} />

      <Card>
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={dict.common.noResults}
              description="Create a new road project to begin the lifecycle."
              action={
                <Link href="/officer/projects/new" className={buttonVariants({ size: "sm" })}>
                  <Plus className="h-4 w-4" /> {dict.common.create}
                </Link>
              }
            />
          </div>
        ) : (
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.fields.projectCode}</TableHead>
                  <TableHead>{dict.fields.projectName}</TableHead>
                  <TableHead>{dict.fields.road}</TableHead>
                  <TableHead>{dict.fields.ward}</TableHead>
                  <TableHead className="text-right">{dict.fields.cost}</TableHead>
                  <TableHead>{dict.common.status}</TableHead>
                  <TableHead className="w-40">{dict.fields.progress}</TableHead>
                  <TableHead className="text-right">{dict.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.project_code}</TableCell>
                    <TableCell>{p.project_name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.road_name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.ward}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatINR(p.approved_cost ?? p.estimated_cost, { compact: true })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={p.status} />
                    </TableCell>
                    <TableCell>
                      <ProgressBar value={progress[p.id] ?? 0} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/officer/projects/${p.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
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
          </div>
        )}
      </Card>
    </div>
  );
}
