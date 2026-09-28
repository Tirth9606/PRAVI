"use server";

import { revalidatePath } from "next/cache";
import { authorize, ok, toActionError, parseForm, fail, type ActionResult } from "@/lib/action-helpers";
import {
  budgetSchema,
  tenderSchema,
  contractorSchema,
  bidSchema,
  contractSchema,
} from "@/lib/validation";
import { recordAudit } from "@/lib/audit";
import { transitionProjectStatus } from "@/features/projects/lifecycle-helpers";
import { assertTenderTransition } from "@/lib/domain/lifecycle";
import type { TenderStatus } from "@/lib/domain/enums";

function rp(id: string) {
  revalidatePath(`/officer/projects/${id}`);
}

// --- Budgets ----------------------------------------------------------------
export async function createBudgetAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("budget.approve");
    const input = parseForm(budgetSchema, formData);
    const { error } = await supabase.from("budgets").insert({
      project_id: input.project_id,
      estimated_amount: input.estimated_amount,
      approved_amount: input.approved_amount ?? null,
      funding_source: input.funding_source,
      remarks: input.remarks ?? null,
      status: "DRAFT",
    });
    if (error) throw new Error(error.message);
    await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "budget", entityId: input.project_id });
    rp(input.project_id);
    return ok(undefined, "Budget draft created.");
  } catch (err) {
    return toActionError(err);
  }
}

/** Approve budget → project APPROVED → BUDGET_APPROVED + BUDGET_APPROVAL record. */
export async function approveBudgetAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("budget.approve");
    const budgetId = String(formData.get("budget_id") ?? "");
    const approvedAmount = Number(formData.get("approved_amount") ?? 0);
    if (!budgetId) return fail("Missing budget id.");
    if (!(approvedAmount >= 0)) return fail("Approved amount must be zero or greater.");

    const { data: budget } = await supabase.from("budgets").select("*").eq("id", budgetId).maybeSingle();
    if (!budget) return fail("Budget not found.");

    await supabase
      .from("budgets")
      .update({
        status: "APPROVED",
        approved_amount: approvedAmount,
        approved_by: ctx.profile.id,
        approval_date: new Date().toISOString().slice(0, 10),
      })
      .eq("id", budgetId);

    await transitionProjectStatus({
      supabase,
      userId: ctx.profile.id,
      projectId: budget.project_id,
      to: "BUDGET_APPROVED",
      auditAction: "APPROVE",
      patch: { approved_cost: approvedAmount },
    });

    await supabase.from("project_approvals").insert({
      project_id: budget.project_id,
      approved_by: ctx.profile.id,
      approval_type: "BUDGET_APPROVAL",
      status: "APPROVED",
      approved_at: new Date().toISOString(),
    });

    rp(budget.project_id);
    revalidatePath("/officer/budgets");
    return ok(undefined, "Budget approved.");
  } catch (err) {
    return toActionError(err);
  }
}

// --- Tenders ----------------------------------------------------------------
/** Create a tender. Moves project BUDGET_APPROVED → TENDERING. */
export async function createTenderAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("tender.manage");
    const input = parseForm(tenderSchema, formData);

    const { data: tender, error } = await supabase
      .from("tenders")
      .insert({ ...input, status: "DRAFT", created_by: ctx.profile.id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const { data: project } = await supabase.from("road_projects").select("status").eq("id", input.project_id).maybeSingle();
    if (project?.status === "BUDGET_APPROVED") {
      await transitionProjectStatus({
        supabase,
        userId: ctx.profile.id,
        projectId: input.project_id,
        to: "TENDERING",
        auditAction: "UPDATE",
      });
    }
    await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "tender", entityId: tender.id });
    rp(input.project_id);
    revalidatePath("/officer/tenders");
    return ok(undefined, "Tender created.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function transitionTenderAction(tenderId: string, to: TenderStatus): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("tender.manage");
    const { data: tender } = await supabase.from("tenders").select("*").eq("id", tenderId).maybeSingle();
    if (!tender) return fail("Tender not found.");
    assertTenderTransition(tender.status as TenderStatus, to);
    await supabase.from("tenders").update({ status: to }).eq("id", tenderId);
    await recordAudit({
      userId: ctx.profile.id,
      action: "UPDATE",
      entityType: "tender",
      entityId: tenderId,
      oldValue: { status: tender.status },
      newValue: { status: to },
    });
    rp(tender.project_id);
    revalidatePath("/officer/tenders");
    return ok(undefined, "Tender updated.");
  } catch (err) {
    return toActionError(err);
  }
}

// --- Contractors ------------------------------------------------------------
export async function upsertContractorAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("contractor.manage");
    const input = parseForm(contractorSchema, formData);
    const id = String(formData.get("id") ?? "");
    if (id) {
      const { error } = await supabase.from("contractors").update(input).eq("id", id);
      if (error) throw new Error(error.message);
      await recordAudit({ userId: ctx.profile.id, action: "UPDATE", entityType: "contractor", entityId: id });
    } else {
      const { data, error } = await supabase.from("contractors").insert(input).select("id").single();
      if (error) throw new Error(error.message);
      await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "contractor", entityId: data.id });
    }
    revalidatePath("/officer/contractors");
    return ok(undefined, id ? "Contractor updated." : "Contractor added.");
  } catch (err) {
    return toActionError(err);
  }
}

// --- Bids -------------------------------------------------------------------
export async function createBidAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("bid.review");
    const input = parseForm(bidSchema, formData);
    const { error } = await supabase.from("tender_bids").insert({
      tender_id: input.tender_id,
      contractor_id: input.contractor_id,
      bid_amount: input.bid_amount,
      remarks: input.remarks ?? null,
      status: "SUBMITTED",
    });
    if (error) throw new Error(error.message);
    await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "tender_bid", entityId: input.tender_id });
    revalidatePath("/officer/tenders");
    return ok(undefined, "Bid recorded.");
  } catch (err) {
    return toActionError(err);
  }
}

/**
 * Select a contractor from a bid → award tender, create contract,
 * move project TENDERING → CONTRACTOR_SELECTED (spec §22).
 */
export async function selectContractorAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("contractor.select");
    const bidId = String(formData.get("bid_id") ?? "");
    const contractNumber = String(formData.get("contract_number") ?? "").trim();
    const startDate = String(formData.get("start_date") ?? "");
    const expectedEnd = String(formData.get("expected_end_date") ?? "");
    if (!bidId || !contractNumber || !startDate || !expectedEnd) {
      return fail("Contract number, start date and expected end date are required.");
    }
    if (expectedEnd < startDate) return fail("Expected end date must be on or after start date.");

    const { data: bid } = await supabase.from("tender_bids").select("*").eq("id", bidId).maybeSingle();
    if (!bid) return fail("Bid not found.");
    const { data: tender } = await supabase.from("tenders").select("*").eq("id", bid.tender_id).maybeSingle();
    if (!tender) return fail("Tender not found.");

    // Accept the winning bid; reject the others.
    await supabase.from("tender_bids").update({ status: "ACCEPTED" }).eq("id", bidId);
    await supabase.from("tender_bids").update({ status: "REJECTED" }).eq("tender_id", bid.tender_id).neq("id", bidId);

    if (tender.status !== "AWARDED") {
      await supabase.from("tenders").update({ status: "AWARDED" }).eq("id", tender.id);
    }

    const { data: contract, error: cErr } = await supabase
      .from("contracts")
      .insert({
        project_id: tender.project_id,
        tender_id: tender.id,
        contractor_id: bid.contractor_id,
        contract_number: contractNumber,
        contract_value: bid.bid_amount,
        start_date: startDate,
        expected_end_date: expectedEnd,
        status: "ACTIVE",
      })
      .select("id")
      .single();
    if (cErr) throw new Error(cErr.message);

    await transitionProjectStatus({
      supabase,
      userId: ctx.profile.id,
      projectId: tender.project_id,
      to: "CONTRACTOR_SELECTED",
      auditAction: "CONTRACTOR_SELECTED",
    });

    await recordAudit({
      userId: ctx.profile.id,
      action: "CONTRACTOR_SELECTED",
      entityType: "contract",
      entityId: contract.id,
      newValue: { contractor_id: bid.contractor_id, contract_value: bid.bid_amount },
    });

    rp(tender.project_id);
    return ok(undefined, "Contractor selected and contract created.");
  } catch (err) {
    return toActionError(err);
  }
}

// --- Contracts / work order / construction start ----------------------------
export async function createContractAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("contract.create");
    const input = parseForm(contractSchema, formData);
    const { data, error } = await supabase
      .from("contracts")
      .insert({ ...input, status: "ACTIVE" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "contract", entityId: data.id });
    rp(input.project_id);
    revalidatePath("/officer/contracts");
    return ok(undefined, "Contract created.");
  } catch (err) {
    return toActionError(err);
  }
}

/** Issue work order → contract WORK_ORDER_ISSUED, project CONTRACTOR_SELECTED → WORK_ORDER_ISSUED. */
export async function issueWorkOrderAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("workorder.issue");
    const contractId = String(formData.get("contract_id") ?? "");
    const workOrderNumber = String(formData.get("work_order_number") ?? "").trim();
    if (!contractId || !workOrderNumber) return fail("Work order number is required.");

    const { data: contract } = await supabase.from("contracts").select("*").eq("id", contractId).maybeSingle();
    if (!contract) return fail("Contract not found.");

    await supabase
      .from("contracts")
      .update({ status: "WORK_ORDER_ISSUED", work_order_number: workOrderNumber })
      .eq("id", contractId);

    await transitionProjectStatus({
      supabase,
      userId: ctx.profile.id,
      projectId: contract.project_id,
      to: "WORK_ORDER_ISSUED",
      auditAction: "WORK_ORDER_ISSUED",
    });

    rp(contract.project_id);
    revalidatePath("/officer/contracts");
    return ok(undefined, "Work order issued.");
  } catch (err) {
    return toActionError(err);
  }
}

/** Begin construction → project WORK_ORDER_ISSUED → UNDER_CONSTRUCTION. */
export async function startConstructionAction(projectId: string): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("construction.update");
    await transitionProjectStatus({
      supabase,
      userId: ctx.profile.id,
      projectId,
      to: "UNDER_CONSTRUCTION",
      auditAction: "UPDATE",
      patch: { actual_start_date: new Date().toISOString().slice(0, 10) },
    });
    rp(projectId);
    return ok(undefined, "Construction started.");
  } catch (err) {
    return toActionError(err);
  }
}
