import { UserRole } from "@/server/models/types";

export type NavItem = {
  key: string;
  label: string;
  href: string;
};

export function getNavItems(input: { role: UserRole; villageId?: string }): NavItem[] {
  const items: NavItem[] = [];

  if (input.role === UserRole.SUPER_ADMIN) {
    items.push({ key: "sa-dash", label: "Dashboard", href: "/superadmin/dashboard" });
    items.push({ key: "sa-users", label: "Users", href: "/superadmin/users" });
    items.push({ key: "sa-villages", label: "Villages", href: "/superadmin/villages" });
    items.push({
      key: "sa-global-rates",
      label: "कराचे दर (ग्लोबल)",
      href: "/superadmin/rates/construction-land",
    });
    items.push({
      key: "sa-water-supply-rates",
      label: "पाणी पुरवठा कराचे दर",
      href: "/superadmin/rates/water-supply",
    });
    items.push({
      key: "sa-health-tax-slabs",
      label: "आरोग्य कर (Slab)",
      href: "/superadmin/rates/health-tax",
    });
    items.push({
      key: "sa-electricity-supply-tax-slabs",
      label: "विजपुरवठा कर (Slab)",
      href: "/superadmin/rates/electricity-tax",
    });
    items.push({
      key: "sa-divabatti-tax-slabs",
      label: "दिवाबत्ती कर (Slab)",
      href: "/superadmin/rates/divabatti-tax",
    });
    items.push({
      key: "sa-depreciation-rates",
      label: "इमारतीचे आयुष्य (वय) नुसार घसारी दर",
      href: "/superadmin/rates/depreciation",
    });
    items.push({
      key: "sa-usage-factor-rates",
      label: "इमारतीचा वापर आणि भारांक",
      href: "/superadmin/rates/usage-factor",
    });

    return items;
  }

  // Regular users (ADMIN/USER) without village access
  if (!input.villageId && (input.role === UserRole.ADMIN || input.role === UserRole.USER)) {
    items.push({ key: "u-dash", label: "Dashboard", href: "/user/dashboard" });
    items.push({ key: "u-village", label: "My Village", href: "/user/village" });
    return items;
  }

  // Users with village access
  if (input.villageId) {
    items.push({ key: "v-dash", label: "Dashboard", href: `/village/${input.villageId}/dashboard` });
    items.push({ key: "v-village", label: "My Village", href: `/village/${input.villageId}` });
  }

  return items;
}
