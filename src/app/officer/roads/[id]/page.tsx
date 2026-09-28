import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getRoadDetail } from "@/features/roads/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { enumLabel } from "@/locales/enum-labels";
import { DefectForm, MaintenanceForm, MaintenanceActions, AssignInspectorRoadForm } from "@/features/roads/road-forms";
import { DocumentUpload } from "@/features/documents/document-upload";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { DetailList } from "@/components/ui/detail-list";
import { EmptyState } from "@/components/ui/states";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatINR, formatDate } from "@/lib/utils";
import type { AppUser } from "@/types/models";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getRoadDetail(id).catch(() => null);
  return { title: detail?.road.road_code ?? "Road" };
}

export default async function RoadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { locale, dict } = await getDict();
  const detail = await getRoadDetail(id);
  if (!detail) notFound();

  const sb = await createSupabaseServerClient();
  const { data: inspectors } = await sb.from("users").select("*").eq("role", "FIELD_INSPECTOR").eq("status", "ACTIVE").order("name");
  const r = detail.road;

  const overview = (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>{dict.tabs.overview}</CardTitle></CardHeader>
        <CardContent>
          <DetailList
            items={[
              { label: "Road Code", value: r.road_code },
              { label: dict.common.status, value: <StatusBadge value={r.status} /> },
              { label: dict.fields.condition, value: <StatusBadge value={r.current_condition} /> },
              { label: dict.fields.priority, value: <StatusBadge value={r.priority} /> },
              { label: dict.fields.roadType, value: enumLabel(r.road_type, locale) },
              { label: dict.fields.lengthKm, value: r.length_km },
              { label: dict.fields.location, value: r.location },
              { label: dict.fields.ward, value: r.ward },
              { label: dict.fields.lastInspection, value: formatDate(r.last_inspection_date) },
              { label: dict.fields.lastMaintenance, value: formatDate(r.last_maintenance_date) },
              { label: "Handover", value: formatDate(r.handover_date) },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Assign inspector</CardTitle></CardHeader>
        <CardContent>
          <AssignInspectorRoadForm roadId={r.id} inspectors={(inspectors ?? []) as AppUser[]} />
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { key: "overview", label: dict.tabs.overview, content: overview },
    {
      key: "inspections",
      label: dict.tabs.inspections,
      badge: detail.inspections.length,
      content: (
        <Card><CardContent className="pt-5">
          {detail.inspections.length === 0 ? <EmptyState title={dict.common.noResults} /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>{dict.fields.date}</TableHead><TableHead>{dict.fields.condition}</TableHead>
                <TableHead>{dict.fields.severity}</TableHead><TableHead>{dict.common.status}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {detail.inspections.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{formatDate(i.inspection_date)}</TableCell>
                    <TableCell><StatusBadge value={i.condition} /></TableCell>
                    <TableCell><StatusBadge value={i.severity} /></TableCell>
                    <TableCell><StatusBadge value={i.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent></Card>
      ),
    },
    {
      key: "defects",
      label: dict.tabs.defects,
      badge: detail.defects.filter((d) => d.status === "OPEN").length,
      content: (
        <Card><CardContent className="space-y-4 pt-5">
          <DefectForm roadId={r.id} />
          {detail.defects.length === 0 ? <EmptyState title={dict.common.noResults} /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>{dict.fields.type}</TableHead><TableHead>{dict.fields.severity}</TableHead>
                <TableHead className="text-right">{dict.fields.quantity}</TableHead><TableHead>{dict.common.status}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {detail.defects.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{enumLabel(d.type, locale)}</TableCell>
                    <TableCell><StatusBadge value={d.severity} /></TableCell>
                    <TableCell className="text-right tabular-nums">{d.quantity}</TableCell>
                    <TableCell><StatusBadge value={d.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent></Card>
      ),
    },
    {
      key: "maintenance",
      label: dict.tabs.maintenance,
      badge: detail.maintenance.filter((m) => m.status !== "COMPLETED" && m.status !== "CANCELLED").length,
      content: (
        <Card><CardContent className="space-y-4 pt-5">
          <MaintenanceForm roadId={r.id} />
          {detail.maintenance.length === 0 ? <EmptyState title={dict.common.noResults} /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>{dict.fields.workType}</TableHead><TableHead>{dict.fields.priority}</TableHead>
                <TableHead className="text-right">Est.</TableHead><TableHead className="text-right">Actual</TableHead>
                <TableHead>{dict.common.status}</TableHead><TableHead className="text-right">{dict.common.actions}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {detail.maintenance.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.work_type}</TableCell>
                    <TableCell><StatusBadge value={m.priority} /></TableCell>
                    <TableCell className="text-right tabular-nums">{formatINR(m.estimated_cost, { compact: true })}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatINR(m.actual_cost, { compact: true })}</TableCell>
                    <TableCell><StatusBadge value={m.status} /></TableCell>
                    <TableCell className="text-right"><MaintenanceActions id={m.id} status={m.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent></Card>
      ),
    },
    {
      key: "cost",
      label: dict.tabs.costHistory,
      content: (
        <Card><CardContent className="pt-5">
          <DetailList items={[
            { label: "Total maintenance spend", value: formatINR(detail.costHistory.total) },
            { label: "Completed maintenance tasks", value: detail.costHistory.count },
          ]} />
          <p className="mt-2 text-xs italic text-muted-foreground">* {dict.common.estimatedNote}.</p>
        </CardContent></Card>
      ),
    },
    {
      key: "documents",
      label: dict.tabs.documents,
      badge: detail.documents.length,
      content: (
        <Card><CardContent className="space-y-4 pt-5">
          <DocumentUpload bucket="maintenance-documents" roadId={r.id} />
          {detail.documents.length === 0 ? <EmptyState title={dict.common.noResults} /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>File</TableHead><TableHead>{dict.fields.date}</TableHead></TableRow></TableHeader>
              <TableBody>
                {detail.documents.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{enumLabel(d.category, locale)}</TableCell>
                    <TableCell>{d.file_name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(d.created_at)}</TableCell>
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
      <PageHeader
        title={`${r.road_code} — ${r.road_name}`}
        description={`${r.location} · ${r.ward}`}
        actions={
          <Link href="/officer/roads" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="h-4 w-4" /> {dict.common.back}
          </Link>
        }
      />
      <Tabs tabs={tabs} />
    </div>
  );
}
