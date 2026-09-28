import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/domain/rbac";

export default async function HomePage() {
  const ctx = await getCurrentUser().catch(() => null);
  if (ctx) redirect(ROLE_HOME[ctx.profile.role]);
  redirect("/login");
}
