import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getDict } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Privacy" };

export default async function PrivacyPage() {
  const { dict } = await getDict();
  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-semibold">{dict.nav.privacy}</h1>
          <p className="text-sm text-muted-foreground">{dict.app.name}</p>
        </div>
      </div>

      <Card className="border-warning/40 bg-warning/5">
        <CardContent className="pt-5 text-sm">
          <strong>Prototype / hackathon disclaimer.</strong> {dict.app.disclaimer} This system is a
          demonstration and must not be used to store real citizen or official government records.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>What we do not collect</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This platform deliberately does <strong>not</strong> collect or store:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Aadhaar numbers or any national identity numbers</li>
            <li>Biometric data (fingerprints, facial data, iris scans)</li>
            <li>Sensitive personal information</li>
            <li>Personal financial information (bank accounts, card details)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>What we do process</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Only operational data required to manage road projects: project records, budgets,
            tenders, contracts, inspections, defects, maintenance, and the official audit trail.
            User accounts store a name, work email, role and department for access control.
          </p>
          <p>
            Authentication is handled by Supabase Auth. Passwords are never stored by this
            application. Access is restricted by role-based access control and database row-level
            security. Uploaded documents are stored in private buckets and served through
            short-lived signed links.
          </p>
        </CardContent>
      </Card>

      <Link href="/login" className={buttonVariants({ variant: "outline" })}>
        {dict.common.back}
      </Link>
    </main>
  );
}
