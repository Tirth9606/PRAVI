import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProjectDetail } from "@/features/projects/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { enumLabel } from "@/locales/enum-labels";
import {
  submitProjectAction,
  reviewProjectAction,
  cancelProjectAction,
} from "@/features/projects/actions";
import { startConstructionAction } from "@/features/procurement/actions";
import {
  ApproveProjectForm,
  CompleteProjectForm,
  HandoverProjectForm,
  BudgetForm,
  BudgetApproveInline,
  TenderForm,
  BidForm,
  SelectContractorForm,
  WorkOrderForm,
  ConstructionUpdateForm,
  TenderTransitionButtons,
  AssignInspectorForm,
} from "@/features/projects/project-forms";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ActionButton } from "@/components/forms/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { DetailList } from "@/components/ui/detail-list";
import { LifecycleTimeline } from "@/components/ui/lifecycle-timeline";
import { AuditTrail } from "@/components/ui/audit-trail";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/states";
import { DocumentUpload } from "@/features/documents/document-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR, formatDate } from "@/lib/utils";
import type { AppUser, Contractor } from "@/types/models";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProjectDetail(id).catch(() => null);

  return {
    title: detail?.project.project_code ?? "Project",
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, dict } = await getDict();
  const detail = await getProjectDetail(id);

  if (!detail) notFound();

  const sb = await createSupabaseServerClient();

  const [{ data: contractors }, { data: inspectors }] = await Promise.all([
    sb
      .from("contractors")
      .select("*")
      .eq("status", "ACTIVE")
      .order("name"),
    sb
      .from("users")
      .select("*")
      .eq("role", "FIELD_INSPECTOR")
      .eq("status", "ACTIVE")
      .order("name"),
  ]);

  const p = detail.project;
  const activeContract = detail.contracts.find(
    (c) => c.status !== "TERMINATED"
  );

  const overview = (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{dict.tabs.overview}</CardTitle>
          </CardHeader>

          <CardContent>
            <DetailList
              items={[
                {
                  label: dict.fields.projectCode,
                  value: p.project_code,
                },
                {
                  label: dict.common.status,
                  value: <StatusBadge value={p.status} />,
                },
                {
                  label: dict.fields.roadName,
                  value: p.road_name,
                },
                {
                  label: dict.fields.roadType,
                  value: enumLabel(p.road_type, locale),
                },
                {
                  label: dict.fields.location,
                  value: p.location,
                },
                {
                  label: dict.fields.ward,
                  value: p.ward,
                },
                {
                  label: dict.fields.lengthKm,
                  value: p.length_km,
                },
                {
                  label: dict.fields.duration,
                  value: p.estimated_duration_months,
                },
                {
                  label: dict.fields.estimatedCost,
                  value: formatINR(p.estimated_cost),
                },
                {
                  label: dict.fields.approvedCost,
                  value: formatINR(p.approved_cost),
                },
                {
                  label: dict.fields.finalCost,
                  value: formatINR(p.final_cost),
                },
                {
                  label: dict.fields.progress,
                  value: (
                    <ProgressBar value={detail.latestProgress ?? 0} />
                  ),
                },
              ]}
            />

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {dict.fields.reason}
              </p>
              <p className="text-sm">{p.project_reason}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next action</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <NextAction
              status={p.status}
              projectId={p.id}
              hasActiveContract={!!activeContract}
            />

            {!["COMPLETED", "HANDED_OVER", "CANCELLED"].includes(
              p.status
            ) && (
              <ActionButton
                variant="ghost"
                size="sm"
                confirm="Cancel this project? This cannot be undone."
                action={cancelProjectAction.bind(null, p.id)}
              >
                Cancel project
              </ActionButton>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign inspector</CardTitle>
          </CardHeader>

          <CardContent>
            <AssignInspectorForm
              projectId={p.id}
              inspectors={(inspectors ?? []) as AppUser[]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lifecycle</CardTitle>
        </CardHeader>

        <CardContent>
          <LifecycleTimeline status={p.status} />
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    {
      key: "overview",
      label: dict.tabs.overview,
      content: overview,
    },

    {
      key: "approval",
      label: dict.tabs.approval,
      badge: detail.approvals.length,
      content: (
        <Card>
          <CardContent className="space-y-4 pt-5">
            {p.status === "UNDER_REVIEW" && (
              <ApproveProjectForm projectId={p.id} />
            )}

            {detail.approvals.length === 0 ? (
              <EmptyState title={dict.common.noResults} />
            ) : (
              <SimpleTable
                head={[
                  "Type",
                  dict.common.status,
                  dict.fields.date,
                  dict.fields.remarks,
                ]}
                rows={detail.approvals.map((a) => [
                  enumLabel(a.approval_type, locale),
                  <StatusBadge key="s" value={a.status} />,
                  formatDate(a.approved_at ?? a.created_at),
                  a.remarks ?? "—",
                ])}
              />
            )}
          </CardContent>
        </Card>
      ),
    },

    {
      key: "budget",
      label: dict.tabs.budget,
      badge: detail.budgets.length,
      content: (
        <Card>
          <CardContent className="space-y-4 pt-5">
            {p.status === "APPROVED" && (
              <BudgetForm projectId={p.id} />
            )}

            {detail.budgets.length === 0 ? (
              <EmptyState title={dict.common.noResults} />
            ) : (
              <SimpleTable
                head={[
                  dict.fields.estimatedCost,
                  dict.fields.approvedCost,
                  dict.fields.fundingSource,
                  dict.common.status,
                  "",
                ]}
                rows={detail.budgets.map((b) => [
                  formatINR(b.estimated_amount),
                  formatINR(b.approved_amount),
                  b.funding_source,
                  <StatusBadge key="s" value={b.status} />,
                  b.status !== "APPROVED" &&
                  p.status === "APPROVED" ? (
                    <BudgetApproveInline
                      key="a"
                      budgetId={b.id}
                      estimated={b.estimated_amount}
                    />
                  ) : (
                    "—"
                  ),
                ])}
              />
            )}
          </CardContent>
        </Card>
      ),
    },

    {
      key: "tender",
      label: dict.tabs.tender,
      badge: detail.tenders.length,
      content: (
        <Card>
          <CardContent className="space-y-6 pt-5">
            {p.status === "BUDGET_APPROVED" && (
              <TenderForm projectId={p.id} />
            )}

            {detail.tenders.length === 0 ? (
              <EmptyState title={dict.common.noResults} />
            ) : (
              detail.tenders.map((t) => (
                <div
                  key={t.id}
                  className="space-y-3 rounded-md border border-border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{t.tender_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatINR(t.estimated_value)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge value={t.status} />
                      <TenderTransitionButtons
                        tenderId={t.id}
                        status={t.status}
                      />
                    </div>
                  </div>

                  {(t.status === "OPEN" ||
                    t.status === "EVALUATION" ||
                    t.status === "CLOSED") && (
                    <BidForm
                      tenderId={t.id}
                      contractors={(contractors ?? []) as Contractor[]}
                    />
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ),
    },

    {
      key: "contractor",
      label: dict.tabs.contractor,
      content: (
        <Card>
          <CardContent className="space-y-4 pt-5">
            {p.status === "TENDERING" && detail.bids.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Select winning contractor
                </p>

                <SelectContractorForm
                  bids={detail.bids}
                  contractors={(contractors ?? []) as Contractor[]}
                />
              </div>
            )}

            {detail.bids.length > 0 && (
              <SimpleTable
                head={[
                  dict.fields.contractor,
                  dict.fields.bidAmount,
                  dict.common.status,
                ]}
                rows={detail.bids.map((b) => [
                  ((contractors ?? []) as Contractor[]).find(
                    (c) => c.id === b.contractor_id
                  )?.name ?? b.contractor_id,
                  formatINR(b.bid_amount),
                  <StatusBadge key="s" value={b.status} />,
                ])}
              />
            )}

            {activeContract && (
              <div className="rounded-md border border-border p-4">
                <p className="font-medium">
                  {activeContract.contract_number}
                </p>

                <DetailList
                  items={[
                    {
                      label: dict.fields.contractValue,
                      value: formatINR(
                        activeContract.contract_value
                      ),
                    },
                    {
                      label: dict.common.status,
                      value: (
                        <StatusBadge
                          value={activeContract.status}
                        />
                      ),
                    },
                    {
                      label: "Work Order",
                      value:
                        activeContract.work_order_number ?? "—",
                    },
                    {
                      label: "Start",
                      value: formatDate(
                        activeContract.start_date
                      ),
                    },
                  ]}
                />

                {p.status === "CONTRACTOR_SELECTED" && (
                  <div className="mt-3">
                    <WorkOrderForm
                      contractId={activeContract.id}
                    />
                  </div>
                )}
              </div>
            )}

            {detail.bids.length === 0 && !activeContract && (
              <EmptyState title={dict.common.noResults} />
            )}
          </CardContent>
        </Card>
      ),
    },

    {
      key: "construction",
      label: dict.tabs.construction,
      badge: detail.updates.length,
      content: (
        <Card>
          <CardContent className="space-y-4 pt-5">
            {p.status === "UNDER_CONSTRUCTION" && (
              <ConstructionUpdateForm projectId={p.id} />
            )}

            {detail.updates.length === 0 ? (
              <EmptyState title={dict.common.noResults} />
            ) : (
              <SimpleTable
                head={[
                  dict.fields.date,
                  "Stage",
                  "Physical",
                  "Financial",
                  dict.common.status,
                ]}
                rows={detail.updates.map((u) => [
                  formatDate(u.update_date),
                  u.current_stage,
                  `${u.physical_progress}%`,
                  `${u.financial_progress}%`,
                  <StatusBadge key="s" value={u.status} />,
                ])}
              />
            )}
          </CardContent>
        </Card>
      ),
    },

    {
      key: "inspections",
      label: dict.tabs.inspections,
      badge: detail.inspections.length,
      content: (
        <Card>
          <CardContent className="space-y-4 pt-5">
            {detail.inspections.length === 0 ? (
              <EmptyState
                title={dict.common.noResults}
                description="Assigned inspectors submit construction inspections here."
              />
            ) : (
              <SimpleTable
                head={[
                  dict.fields.date,
                  dict.fields.progress,
                  dict.fields.quality,
                  dict.common.status,
                ]}
                rows={detail.inspections.map((i) => [
                  formatDate(i.inspection_date),
                  `${i.progress_percentage}%`,
                  <StatusBadge
                    key="q"
                    value={i.quality_status}
                  />,
                  <StatusBadge
                    key="s"
                    value={i.status}
                  />,
                ])}
              />
            )}
          </CardContent>
        </Card>
      ),
    },

    {
      key: "documents",
      label: dict.tabs.documents,
      badge: detail.documents.length,
      content: (
        <Card>
          <CardContent className="space-y-4 pt-5">
            <DocumentUpload
              bucket="project-documents"
              projectId={p.id}
            />

            {detail.documents.length === 0 ? (
              <EmptyState title={dict.common.noResults} />
            ) : (
              <SimpleTable
                head={["Category", "File", dict.fields.date]}
                rows={detail.documents.map((d) => [
                  enumLabel(d.category, locale),
                  d.file_name,
                  formatDate(d.created_at),
                ])}
              />
            )}
          </CardContent>
        </Card>
      ),
    },

    {
      key: "history",
      label: dict.tabs.history,
      badge: detail.audit.length,
      content: (
        <Card>
          <CardContent className="pt-5">
            <AuditTrail rows={detail.audit} />
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${p.project_code} — ${p.project_name}`}
        description={`${p.road_name} · ${p.ward}`}
        actions={
          <Link
            href="/officer/projects"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="h-4 w-4" />
            {dict.common.back}
          </Link>
        }
      />

      <Tabs tabs={tabs} />
    </div>
  );
}

function NextAction({
  status,
  projectId,
  hasActiveContract,
}: {
  status: string;
  projectId: string;
  hasActiveContract: boolean;
}) {
  switch (status) {
    case "DRAFT":
      return (
        <ActionButton
          action={submitProjectAction.bind(null, projectId)}
        >
          Submit for review
        </ActionButton>
      );

    case "SUBMITTED":
      return (
        <ActionButton
          action={reviewProjectAction.bind(null, projectId)}
        >
          Begin review
        </ActionButton>
      );

    case "UNDER_REVIEW":
      return (
        <p className="text-sm text-muted-foreground">
          Approve this project in the <strong>Approval</strong> tab.
        </p>
      );

    case "APPROVED":
      return (
        <p className="text-sm text-muted-foreground">
          Create and approve a budget in the <strong>Budget</strong>{" "}
          tab.
        </p>
      );

    case "BUDGET_APPROVED":
      return (
        <p className="text-sm text-muted-foreground">
          Create a tender in the <strong>Tender</strong> tab.
        </p>
      );

    case "TENDERING":
      return (
        <p className="text-sm text-muted-foreground">
          Record bids and select a contractor in the{" "}
          <strong>Contractor</strong> tab.
        </p>
      );

    case "CONTRACTOR_SELECTED":
      return (
        <p className="text-sm text-muted-foreground">
          Issue the work order in the <strong>Contractor</strong>{" "}
          tab.
          {!hasActiveContract && " (No active contract found.)"}
        </p>
      );

    case "WORK_ORDER_ISSUED":
      return (
        <ActionButton
          action={startConstructionAction.bind(null, projectId)}
        >
          Start construction
        </ActionButton>
      );

    case "UNDER_CONSTRUCTION":
      return <CompleteProjectForm projectId={projectId} />;

    case "COMPLETED":
      return <HandoverProjectForm projectId={projectId} />;

    case "HANDED_OVER":
      return (
        <p className="text-sm text-success">
          Project handed over. Operational road registered.
        </p>
      );

    case "CANCELLED":
      return (
        <p className="text-sm text-destructive">
          Project cancelled.
        </p>
      );

    default:
      return null;
  }
}

// Small server-rendered table helper reused across tabs.
function SimpleTable({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {head.map((h, i) => (
            <TableHead key={i}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            {r.map((c, j) => (
              <TableCell key={j}>{c}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}