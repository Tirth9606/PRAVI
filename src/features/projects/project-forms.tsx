"use client";

import { useI18n } from "@/components/i18n/i18n-provider";
import { ActionForm, FieldError, SubmitButton } from "@/components/forms/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBudgetAction, approveBudgetAction, createTenderAction, createBidAction, selectContractorAction, issueWorkOrderAction } from "@/features/procurement/actions";
import { createConstructionUpdateAction } from "@/features/construction/actions";
import { approveProjectAction, completeProjectAction, handoverProjectAction } from "@/features/projects/actions";
import { assignInspectorToProjectAction } from "@/features/assignments/actions";
import type { AppUser, TenderBid, Contractor } from "@/types/models";

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function RemarksApprovalForm({
  projectId,
  action,
  submitLabel,
}: {
  projectId: string;
  action: typeof approveProjectAction;
  submitLabel: string;
}) {
  const { dict } = useI18n();
  return (
    <ActionForm action={action} className="max-w-lg">
      <input type="hidden" name="project_id" value={projectId} />
      <div className="space-y-1.5">
        <Label htmlFor={`remarks-${projectId}`}>{dict.fields.remarks}</Label>
        <Textarea id={`remarks-${projectId}`} name="remarks" rows={2} />
        <FieldError name="remarks" />
      </div>
      <SubmitButton>{submitLabel}</SubmitButton>
    </ActionForm>
  );
}

export function ApproveProjectForm({ projectId }: { projectId: string }) {
  const { dict } = useI18n();
  return <RemarksApprovalForm projectId={projectId} action={approveProjectAction} submitLabel={dict.common.approve} />;
}
export function CompleteProjectForm({ projectId }: { projectId: string }) {
  return <RemarksApprovalForm projectId={projectId} action={completeProjectAction} submitLabel="Mark Completed" />;
}
export function HandoverProjectForm({ projectId }: { projectId: string }) {
  return <RemarksApprovalForm projectId={projectId} action={handoverProjectAction} submitLabel="Handover & Register Road" />;
}

export function BudgetForm({ projectId }: { projectId: string }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={createBudgetAction} className="max-w-lg">
      <input type="hidden" name="project_id" value={projectId} />
      <Row>
        <div className="space-y-1.5">
          <Label htmlFor="estimated_amount" required>{dict.fields.estimatedCost}</Label>
          <Input id="estimated_amount" name="estimated_amount" type="number" min="0" required />
          <FieldError name="estimated_amount" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="funding_source" required>{dict.fields.fundingSource}</Label>
          <Input id="funding_source" name="funding_source" required placeholder="State Budget 2026-27" />
          <FieldError name="funding_source" />
        </div>
      </Row>
      <SubmitButton>{dict.common.create}</SubmitButton>
    </ActionForm>
  );
}

export function BudgetApproveInline({ budgetId, estimated }: { budgetId: string; estimated: number }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={approveBudgetAction} className="flex items-end gap-2 space-y-0">
      <input type="hidden" name="budget_id" value={budgetId} />
      <div className="space-y-1">
        <Label htmlFor={`appr-${budgetId}`} className="text-xs">{dict.fields.approvedCost}</Label>
        <Input id={`appr-${budgetId}`} name="approved_amount" type="number" min="0" defaultValue={estimated} className="h-8 w-32" />
      </div>
      <SubmitButton variant="default">{dict.common.approve}</SubmitButton>
    </ActionForm>
  );
}

export function TenderForm({ projectId }: { projectId: string }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={createTenderAction} className="max-w-lg">
      <input type="hidden" name="project_id" value={projectId} />
      <Row>
        <div className="space-y-1.5">
          <Label htmlFor="tender_number" required>Tender Number</Label>
          <Input id="tender_number" name="tender_number" required placeholder="TND-2026-001" />
          <FieldError name="tender_number" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estimated_value" required>{dict.fields.estimatedCost}</Label>
          <Input id="estimated_value" name="estimated_value" type="number" min="0" required />
          <FieldError name="estimated_value" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="opening_date">Opening Date</Label>
          <Input id="opening_date" name="opening_date" type="date" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="closing_date">Closing Date</Label>
          <Input id="closing_date" name="closing_date" type="date" />
          <FieldError name="closing_date" />
        </div>
      </Row>
      <SubmitButton>{dict.common.create}</SubmitButton>
    </ActionForm>
  );
}

export function ConstructionUpdateForm({ projectId }: { projectId: string }) {
  const { dict } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <ActionForm action={createConstructionUpdateAction} className="max-w-lg">
      <input type="hidden" name="project_id" value={projectId} />
      <Row>
        <div className="space-y-1.5">
          <Label htmlFor="update_date" required>{dict.fields.date}</Label>
          <Input id="update_date" name="update_date" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="current_stage" required>Current Stage</Label>
          <Input id="current_stage" name="current_stage" required placeholder="Sub-base laying" />
          <FieldError name="current_stage" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="physical_progress" required>Physical {dict.fields.progress} (%)</Label>
          <Input id="physical_progress" name="physical_progress" type="number" min="0" max="100" required />
          <FieldError name="physical_progress" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="financial_progress" required>Financial {dict.fields.progress} (%)</Label>
          <Input id="financial_progress" name="financial_progress" type="number" min="0" max="100" required />
          <FieldError name="financial_progress" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount_claimed">Amount Claimed</Label>
          <Input id="amount_claimed" name="amount_claimed" type="number" min="0" />
        </div>
      </Row>
      <div className="space-y-1.5">
        <Label htmlFor="cu_remarks">{dict.fields.remarks}</Label>
        <Textarea id="cu_remarks" name="remarks" rows={2} />
      </div>
      <SubmitButton>{dict.common.submit}</SubmitButton>
    </ActionForm>
  );
}

export function BidForm({ tenderId, contractors }: { tenderId: string; contractors: Contractor[] }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={createBidAction} className="max-w-lg">
      <input type="hidden" name="tender_id" value={tenderId} />
      <Row>
        <div className="space-y-1.5">
          <Label htmlFor={`bid_contractor-${tenderId}`} required>{dict.fields.contractor}</Label>
          <Select id={`bid_contractor-${tenderId}`} name="contractor_id" required>
            {contractors.length === 0 && <option value="">— add a contractor first —</option>}
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`bid_amount-${tenderId}`} required>{dict.fields.bidAmount}</Label>
          <Input id={`bid_amount-${tenderId}`} name="bid_amount" type="number" min="0" required />
          <FieldError name="bid_amount" />
        </div>
      </Row>
      <SubmitButton>Record Bid</SubmitButton>
    </ActionForm>
  );
}

export function SelectContractorForm({ bids, contractors }: { bids: TenderBid[]; contractors: Contractor[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const nameOf = (id: string) => contractors.find((c) => c.id === id)?.name ?? id;
  return (
    <ActionForm action={selectContractorAction} className="max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="bid_id" required>Winning Bid</Label>
        <Select id="bid_id" name="bid_id" required>
          {bids.map((b) => (
            <option key={b.id} value={b.id}>
              {nameOf(b.contractor_id)} — ₹{Number(b.bid_amount).toLocaleString("en-IN")}
            </option>
          ))}
        </Select>
        <FieldError name="bid_id" />
      </div>
      <Row>
        <div className="space-y-1.5">
          <Label htmlFor="contract_number" required>Contract Number</Label>
          <Input id="contract_number" name="contract_number" required placeholder="CON-2026-001" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="start_date" required>Start Date</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expected_end_date" required>Expected End Date</Label>
          <Input id="expected_end_date" name="expected_end_date" type="date" required />
        </div>
      </Row>
      <SubmitButton>Select Contractor</SubmitButton>
    </ActionForm>
  );
}

export function WorkOrderForm({ contractId }: { contractId: string }) {
  return (
    <ActionForm action={issueWorkOrderAction} className="max-w-lg">
      <input type="hidden" name="contract_id" value={contractId} />
      <div className="space-y-1.5">
        <Label htmlFor="work_order_number" required>Work Order Number</Label>
        <Input id="work_order_number" name="work_order_number" required placeholder="WO-2026-001" />
      </div>
      <SubmitButton>Issue Work Order</SubmitButton>
    </ActionForm>
  );
}

import { ActionButton } from "@/components/forms/action-button";
import { transitionTenderAction } from "@/features/procurement/actions";
import type { TenderStatus } from "@/lib/domain/enums";

const NEXT_TENDER_STATE: Partial<Record<TenderStatus, { to: TenderStatus; label: string }>> = {
  DRAFT: { to: "OPEN", label: "Publish (Open)" },
  OPEN: { to: "CLOSED", label: "Close Tender" },
  CLOSED: { to: "EVALUATION", label: "Begin Evaluation" },
};

export function TenderTransitionButtons({ tenderId, status }: { tenderId: string; status: TenderStatus }) {
  const next = NEXT_TENDER_STATE[status];
  if (!next) return null;
  return (
    <ActionButton
      variant="outline"
      size="sm"
      action={() => transitionTenderAction(tenderId, next.to)}
    >
      {next.label}
    </ActionButton>
  );
}

export function AssignInspectorForm({ projectId, inspectors }: { projectId: string; inspectors: AppUser[] }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={assignInspectorToProjectAction} className="max-w-md">
      <input type="hidden" name="project_id" value={projectId} />
      <div className="space-y-1.5">
        <Label htmlFor="inspector_id" required>{dict.fields.inspector}</Label>
        <Select id="inspector_id" name="inspector_id" required>
          {inspectors.length === 0 && <option value="">— no inspectors —</option>}
          {inspectors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </Select>
      </div>
      <SubmitButton>Assign</SubmitButton>
    </ActionForm>
  );
}
