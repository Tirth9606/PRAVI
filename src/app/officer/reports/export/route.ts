import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/domain/rbac";
import { buildReportCSV, type ReportType } from "@/features/reports/queries";
import { csvResponse } from "@/lib/csv";
import { recordAudit } from "@/lib/audit";

const VALID: ReportType[] = ["project-status", "construction-progress", "road-condition", "maintenance", "expenditure"];

export async function GET(request: NextRequest) {
  const ctx = await requireUser();
  if (!can(ctx.profile.role, "report.generate")) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const type = request.nextUrl.searchParams.get("type") as ReportType | null;
  if (!type || !VALID.includes(type)) {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }
  const { filename, csv } = await buildReportCSV(type);
  await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "report", newValue: { type } });
  return csvResponse(filename, csv);
}
