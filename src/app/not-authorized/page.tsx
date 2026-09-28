import Link from "next/link";
import { ShieldX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/domain/rbac";

export const metadata = { title: "Not authorized" };

export default async function NotAuthorizedPage() {
  const ctx = await getCurrentUser().catch(() => null);
  const home = ctx ? ROLE_HOME[ctx.profile.role] : "/login";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <ShieldX className="h-12 w-12 text-destructive" aria-hidden />
      <h1 className="text-lg font-semibold">403 — Not authorized</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        You do not have permission to view this page. This restriction is enforced by
        role-based access control and database row-level security.
      </p>
      <Link href={home} className={buttonVariants()}>
        Go to your dashboard
      </Link>
    </div>
  );
}
