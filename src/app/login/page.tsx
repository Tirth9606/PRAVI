import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { ROLE_HOME } from "@/lib/domain/rbac";
import { getDict } from "@/lib/i18n/server";
import { LoginForm } from "@/features/auth/login-form";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Sign in" };

// const DEMO_ACCOUNTS = [
//   { role: "ADMIN", email: "admin@roadgov.demo" },
//   { role: "ROAD_OFFICER", email: "officer@roadgov.demo" },
//   { role: "FIELD_INSPECTOR", email: "inspector@roadgov.demo" },
// ];

export default async function LoginPage() {
  const ctx = await getCurrentUser().catch(() => null);
  if (ctx) redirect(ROLE_HOME[ctx.profile.role]);

  const { dict } = await getDict();
  const configured = isSupabaseConfigured();

  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">{dict.app.name}</p>
          <p className="text-sm text-muted-foreground">{dict.app.tagline}</p>
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{dict.auth.signInTitle}</CardTitle>
          <CardDescription>{dict.auth.signInSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LoginForm configured={configured} />

          <div className="rounded-md border border-border bg-muted/40 p-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {dict.auth.demoAccounts}
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {/* {DEMO_ACCOUNTS.map((a) => (
                <li key={a.email} className="flex justify-between gap-2">
                  <span className="font-medium text-foreground">{a.email}</span>
                  <span>{a.role}</span>
                </li>
              ))} */}
            </ul>
            {/* <p className="mt-2 text-[11px] text-muted-foreground">
              Passwords are set during seeding — see README &gt; Demo flow.
            </p> */}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col items-center gap-3">
        <LanguageSwitcher />
        <p className="max-w-sm text-center text-[11px] text-muted-foreground">{dict.app.disclaimer}</p>
        <Link href="/privacy" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          {dict.nav.privacy}
        </Link>
      </div>
    </main>
  );
}
