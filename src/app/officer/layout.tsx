import { requireRole } from "@/lib/auth/session";
import { AppShell } from "@/components/shell/app-shell";
import { getLocale } from "@/lib/i18n/server";
import { enumLabel } from "@/locales/enum-labels";
import { ROLE_HOME } from "@/lib/domain/rbac";

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("ROAD_OFFICER");
  const locale = await getLocale();
  return (
    <AppShell
      role="ROAD_OFFICER"
      name={profile.name}
      roleLabel={enumLabel(profile.role, locale)}
      home={ROLE_HOME.ROAD_OFFICER}
    >
      {children}
    </AppShell>
  );
}
