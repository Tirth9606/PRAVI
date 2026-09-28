import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { ContractorForm } from "@/features/procurement/contractor-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import type { Contractor } from "@/types/models";

export const metadata = { title: "Contractors" };
export const dynamic = "force-dynamic";

export default async function ContractorsPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("contractors").select("*").order("name");
  const rows = (data ?? []) as Contractor[];

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.contractors} description="Registered contractors eligible to bid." />
      <ContractorForm />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title={dict.common.noResults} description="Add a contractor to begin recording bids." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reg. No.</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Experience</TableHead>
                <TableHead>{dict.common.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.registration_number}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.contact_person}
                    {c.phone ? ` · ${c.phone}` : ""}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.experience_years ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge value={c.status} />
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
