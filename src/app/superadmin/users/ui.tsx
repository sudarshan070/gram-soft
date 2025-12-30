"use client";

import { Button, Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";

import { AppShell } from "@/ui/layouts/AppShell";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
};

export function SuperAdminUsersClient(props: { users: UserRow[] }) {
  const columns: ColumnsType<UserRow> = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Role", dataIndex: "role" },
    { title: "Status", dataIndex: "status" },
  ];

  return (
    <AppShell
      title="Users"
      menuItems={[
        { key: "dash", label: "Dashboard", href: "/superadmin/dashboard" },
        { key: "users", label: "Users", href: "/superadmin/users" },
        { key: "new-user", label: "Create User", href: "/superadmin/users/new" },
      ]}
    >
      <Card
        title="Users"
        extra={
          <Button type="primary">
            <Link href="/superadmin/users/new">Create User</Link>
          </Button>
        }
      >
        <Table
          rowKey={(r) => r._id}
          columns={columns}
          dataSource={props.users}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </AppShell>
  );
}
