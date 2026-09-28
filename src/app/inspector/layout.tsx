import { requireRole } from "@/lib/auth/session";
import { AppShell } from "@/components/shell/app-shell";
import { getLocale } from "@/lib/i18n/server";
import { enumLabel } from "@/locales/enum-labels";
import { ROLE_HOME } from "@/lib/domain/rbac";

export default async function InspectorLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("FIELD_INSPECTOR");
  const locale = await getLocale();
  return (
    <AppShell
      role="FIELD_INSPECTOR"
      name={profile.name}
      roleLabel={enumLabel(profile.role, locale)}
      home={ROLE_HOME.FIELD_INSPECTOR}
    >
      {children}
    </AppShell>
  );
}
