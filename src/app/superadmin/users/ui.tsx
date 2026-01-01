"use client";

import { App, Button, Card, Form, Input, Modal, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/ui/layouts/AppShell";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
};

type ApiErrorShape = { code: string; message: string; details?: unknown };
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorShape };

type CreateUserResponse = {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
};

export function SuperAdminUsersClient(props: { users: UserRow[] }) {
  const router = useRouter();
  const { message } = App.useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<UserRow> = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Role", dataIndex: "role" },
    { title: "Status", dataIndex: "status" },
  ];

  async function onCreate(values: {
    name: string;
    email: string;
    password: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "USER";
    status?: "ACTIVE" | "INACTIVE";
  }) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = (await res.json()) as ApiResponse<CreateUserResponse>;

      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Create user failed");
        return;
      }

      message.success("User created");
      setCreateOpen(false);
      form.resetFields();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title="Users"
      role="SUPER_ADMIN"
    >
      <Card
        title="Users"
        extra={
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            Create User
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

      <Modal
        title="Create User"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onCreate}
          initialValues={{ role: "USER", status: "ACTIVE" }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}
          >
            <Input placeholder="Enter email" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "USER", label: "USER" },
                { value: "ADMIN", label: "ADMIN" },
                { value: "SUPER_ADMIN", label: "SUPER_ADMIN" },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "INACTIVE", label: "INACTIVE" },
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={submitting}>
            Create
          </Button>
        </Form>
      </Modal>
    </AppShell>
  );
}
