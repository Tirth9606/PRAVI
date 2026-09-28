import { Users, Building2, FolderKanban, Route } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditTrail } from "@/components/ui/audit-trail";
import type { AuditLog } from "@/types/models";

export const metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

async function count(sb: any, table: string, apply?: (q: any) => any): Promise<number> {
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (apply) q = apply(q);
  const { count: c } = await q;
  return c ?? 0;
}

export default async function AdminDashboardPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const [users, activeUsers, depts, projects, roads, recent] = await Promise.all([
    count(sb, "users"),
    count(sb, "users", (q: any) => q.eq("status", "ACTIVE")),
    count(sb, "departments"),
    count(sb, "road_projects"),
    count(sb, "roads"),
    sb.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(15),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={dict.nav.dashboard} description="System administration & governance overview." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label={dict.nav.users} value={users} icon={Users} hint={`${activeUsers} active`} href="/admin/users" />
        <StatCard label={dict.nav.departments} value={depts} icon={Building2} href="/admin/departments" />
        <StatCard label={dict.nav.projects} value={projects} icon={FolderKanban} />
        <StatCard label={dict.nav.roads} value={roads} icon={Route} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.nav.auditLogs}</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTrail rows={(recent.data ?? []) as AuditLog[]} />
        </CardContent>
      </Card>
    </div>
  );
}
