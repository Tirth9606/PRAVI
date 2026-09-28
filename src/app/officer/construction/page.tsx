import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLatestProgress } from "@/features/projects/queries";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/states";
import { buttonVariants } from "@/components/ui/button";
import type { RoadProject } from "@/types/models";

export const metadata = { title: "Construction" };
export const dynamic = "force-dynamic";

export default async function ConstructionPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("road_projects")
    .select("*")
    .in("status", ["UNDER_CONSTRUCTION", "WORK_ORDER_ISSUED"])
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as RoadProject[];
  const progress = await getLatestProgress(rows.map((r) => r.id));

  return (
    <div className="space-y-4">
      <PageHeader title={dict.dashboard.constructionOverview} description="Projects currently in the construction phase." />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title={dict.common.noResults} description="No projects are under construction." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.fields.projectCode}</TableHead>
                <TableHead>{dict.fields.road}</TableHead>
                <TableHead>{dict.fields.ward}</TableHead>
                <TableHead className="w-48">{dict.fields.progress}</TableHead>
                <TableHead className="text-right">{dict.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.project_code}</TableCell>
                  <TableCell>{p.road_name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.ward}</TableCell>
                  <TableCell>
                    <ProgressBar value={progress[p.id] ?? 0} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/officer/projects/${p.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      {dict.common.view}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
