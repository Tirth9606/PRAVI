import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";
import { ROLE_HOME, ROUTE_ROLE_ACCESS } from "@/lib/domain/rbac";
import type { UserRole } from "@/lib/domain/enums";

/**
 * Session-refreshing middleware + coarse route protection.
 * The fine-grained authorization is done in layouts/pages/server actions +
 * database RLS. This layer keeps the auth cookie fresh and blocks obvious
 * cross-role navigation early.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const env = getSupabaseEnv();
  // If Supabase isn't configured yet, don't crash the app — only the /login and
  // data-backed routes will surface the configuration error (spec §47).
  if (!env) return response;

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/admin") ||
    path.startsWith("/officer") ||
    path.startsWith("/inspector");

  // Not signed in -> bounce protected routes to /login.
  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(loginUrl);
  }

  // Signed in -> enforce coarse role/segment ownership.
  if (user && isProtected) {
    const role = (user.app_metadata?.role ??
      user.user_metadata?.role) as UserRole | undefined;
    const segment = path.split("/")[1]; // admin | officer | inspector
    const allowed = ROUTE_ROLE_ACCESS[segment];
    if (role && allowed && !allowed.includes(role)) {
      const home = request.nextUrl.clone();
      home.pathname = ROLE_HOME[role] ?? "/login";
      return NextResponse.redirect(home);
    }
  }

  return response;
}
