import { z } from "zod";
import {
  ROAD_TYPES,
  ROAD_CONDITIONS,
  PRIORITIES,
  DEFECT_TYPES,
  QUALITY_STATUSES,
  USER_ROLES,
  USER_STATUSES,
  CONTRACTOR_STATUSES,
} from "@/lib/domain/enums";

// --- Reusable primitives -----------------------------------------------------
const nonNegNumber = z.coerce.number().min(0, "Must be zero or greater");
const positiveInt = z.coerce.number().int().positive("Must be greater than zero");
const percent = z.coerce.number().min(0, "Min 0").max(100, "Max 100");
const requiredText = (max = 200) => z.string().trim().min(1, "Required").max(max);
const optionalText = (max = 2000) =>
  z.string().trim().max(max).optional().or(z.literal(undefined));
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

export const projectCreateSchema = z
  .object({
    project_code: requiredText(50),
    project_name: requiredText(200),
    road_name: requiredText(200),
    location: requiredText(200),
    ward: requiredText(100),
    area: optionalText(100),
    road_type: z.enum(ROAD_TYPES),
    length_km: nonNegNumber,
    project_reason: requiredText(2000),
    estimated_cost: nonNegNumber,
    estimated_duration_months: positiveInt,
    department_id: z.string().uuid().optional(),
    planned_start_date: isoDate.optional(),
    planned_end_date: isoDate.optional(),
  })
  .refine(
    (v) => !v.planned_start_date || !v.planned_end_date || v.planned_end_date >= v.planned_start_date,
    { path: ["planned_end_date"], message: "End date must be on or after start date" },
  );

export const projectApprovalSchema = z.object({
  project_id: z.string().uuid(),
  remarks: optionalText(1000),
});

export const budgetSchema = z.object({
  project_id: z.string().uuid(),
  estimated_amount: nonNegNumber,
  approved_amount: nonNegNumber.optional(),
  funding_source: requiredText(200),
  remarks: optionalText(1000),
});

export const tenderSchema = z
  .object({
    project_id: z.string().uuid(),
    tender_number: requiredText(50),
    estimated_value: nonNegNumber,
    published_date: isoDate.optional(),
    opening_date: isoDate.optional(),
    closing_date: isoDate.optional(),
  })
  .refine((v) => !v.opening_date || !v.closing_date || v.closing_date >= v.opening_date, {
    path: ["closing_date"],
    message: "Closing date must be on or after opening date",
  });

export const contractorSchema = z.object({
  name: requiredText(200),
  registration_number: requiredText(80),
  contact_person: requiredText(200),
  phone: optionalText(30),
  email: z.string().email().optional().or(z.literal(undefined)),
  address: optionalText(400),
  experience_years: z.coerce.number().int().min(0).max(120).optional(),
  status: z.enum(CONTRACTOR_STATUSES).default("ACTIVE"),
});

export const bidSchema = z.object({
  tender_id: z.string().uuid(),
  contractor_id: z.string().uuid(),
  bid_amount: nonNegNumber,
  remarks: optionalText(1000),
});

export const contractSchema = z
  .object({
    project_id: z.string().uuid(),
    tender_id: z.string().uuid().optional(),
    contractor_id: z.string().uuid(),
    contract_number: requiredText(50),
    contract_value: nonNegNumber,
    work_order_number: optionalText(50),
    start_date: isoDate,
    expected_end_date: isoDate,
  })
  .refine((v) => v.expected_end_date >= v.start_date, {
    path: ["expected_end_date"],
    message: "Expected end date must be on or after start date",
  });

export const constructionUpdateSchema = z.object({
  project_id: z.string().uuid(),
  update_date: isoDate,
  physical_progress: percent,
  financial_progress: percent,
  amount_claimed: nonNegNumber.optional(),
  current_stage: requiredText(200),
  remarks: optionalText(1000),
});

export const constructionInspectionSchema = z.object({
  project_id: z.string().uuid(),
  inspection_date: isoDate,
  progress_percentage: percent,
  quality_status: z.enum(QUALITY_STATUSES),
  issues_found: optionalText(1000),
  remarks: optionalText(1000),
  photo_urls: z.string().optional(),
});

export const roadSchema = z.object({
  project_id: z.string().uuid().optional(),
  road_code: requiredText(50),
  road_name: requiredText(200),
  location: requiredText(200),
  ward: requiredText(100),
  area: optionalText(100),
  road_type: z.enum(ROAD_TYPES),
  length_km: nonNegNumber,
  current_condition: z.enum(ROAD_CONDITIONS).default("GOOD"),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
});

export const roadInspectionSchema = z.object({
  road_id: z.string().uuid(),
  inspection_date: isoDate,
  condition: z.enum(ROAD_CONDITIONS),
  severity: z.enum(PRIORITIES),
  remarks: optionalText(1000),
  photo_urls: z.string().optional(),
});

export const defectSchema = z.object({
  road_id: z.string().uuid(),
  inspection_id: z.string().uuid().optional(),
  type: z.enum(DEFECT_TYPES),
  severity: z.enum(PRIORITIES),
  quantity: nonNegNumber.default(1),
  description: optionalText(1000),
});

export const maintenanceSchema = z.object({
  road_id: z.string().uuid(),
  inspection_id: z.string().uuid().optional(),
  work_type: requiredText(200),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  estimated_cost: nonNegNumber,
  remarks: optionalText(1000),
});

export const maintenanceCompleteSchema = z.object({
  id: z.string().uuid(),
  actual_cost: nonNegNumber,
  completion_date: isoDate,
  remarks: optionalText(1000),
});

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: requiredText(200),
  email: z.string().email(),
  phone: optionalText(30),
  role: z.enum(USER_ROLES),
  department_id: z.string().uuid().optional(),
  status: z.enum(USER_STATUSES).default("ACTIVE"),
});

export const departmentSchema = z.object({
  id: z.string().uuid().optional(),
  name: requiredText(200),
  code: requiredText(30),
  contact_email: z.string().email().optional().or(z.literal(undefined)),
});
