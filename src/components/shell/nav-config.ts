import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Wallet,
  Gavel,
  Building,
  FileSignature,
  HardHat,
  Route,
  Wrench,
  BarChart3,
  Users,
  Building2,
  ScrollText,
  ClipboardCheck,
  TriangleAlert,
} from "lucide-react";
import type { UserRole } from "@/lib/domain/enums";
import type { Dictionary } from "@/locales";

export interface NavItem {
  href: string;
  labelKey: keyof Dictionary["nav"];
  icon: LucideIcon;
}

const OFFICER_NAV: NavItem[] = [
  { href: "/officer/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/officer/projects", labelKey: "projects", icon: FolderKanban },
  { href: "/officer/approvals", labelKey: "approvals", icon: CheckSquare },
  { href: "/officer/budgets", labelKey: "budgets", icon: Wallet },
  { href: "/officer/tenders", labelKey: "tenders", icon: Gavel },
  { href: "/officer/contractors", labelKey: "contractors", icon: Building },
  { href: "/officer/contracts", labelKey: "contracts", icon: FileSignature },
  { href: "/officer/construction", labelKey: "construction", icon: HardHat },
  { href: "/officer/roads", labelKey: "roads", icon: Route },
  { href: "/officer/maintenance", labelKey: "maintenance", icon: Wrench },
  { href: "/officer/reports", labelKey: "reports", icon: BarChart3 },
];

const INSPECTOR_NAV: NavItem[] = [
  { href: "/inspector/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/inspector/projects", labelKey: "projects", icon: FolderKanban },
  { href: "/inspector/roads", labelKey: "roads", icon: Route },
  { href: "/inspector/inspections", labelKey: "inspections", icon: ClipboardCheck },
  { href: "/inspector/defects", labelKey: "defects", icon: TriangleAlert },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/users", labelKey: "users", icon: Users },
  { href: "/admin/departments", labelKey: "departments", icon: Building2 },
  { href: "/admin/audit-logs", labelKey: "auditLogs", icon: ScrollText },
];

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  ADMIN: ADMIN_NAV,
  ROAD_OFFICER: OFFICER_NAV,
  FIELD_INSPECTOR: INSPECTOR_NAV,
};
