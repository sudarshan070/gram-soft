"use client";

import { Card, Col, Row, Statistic } from "antd";

import { AppShell } from "@/ui/layouts/AppShell";

export function SuperAdminDashboardClient(props: {
  stats: { users: number; admins: number; villages: number };
}) {
  return (
    <AppShell
      title="Super Admin Dashboard"
      menuItems={[
        { key: "dash", label: "Dashboard", href: "/superadmin/dashboard" },
        { key: "users", label: "Users", href: "/superadmin/users" },
        { key: "new-user", label: "Create User", href: "/superadmin/users/new" },
      ]}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Users" value={props.stats.users} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Admins" value={props.stats.admins} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Villages" value={props.stats.villages} />
          </Card>
        </Col>
      </Row>
    </AppShell>
  );
}
