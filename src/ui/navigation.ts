import type { UserRole } from "@/server/models";

export type NavItem = {
  key: string;
  label: string;
  href: string;
};

export function getNavItems(input: { role: UserRole; villageId?: string }): NavItem[] {
  const items: NavItem[] = [];

  if (input.role === "SUPER_ADMIN") {
    items.push({ key: "sa-dash", label: "Dashboard", href: "/superadmin/dashboard" });
    items.push({ key: "sa-users", label: "Users", href: "/superadmin/users" });
    return items;
  }

  if (input.villageId) {
    items.push({ key: "v-dash", label: "Dashboard", href: `/village/${input.villageId}/dashboard` });
  }

  return items;
}
