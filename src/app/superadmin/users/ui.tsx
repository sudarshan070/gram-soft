"use client";

import { App, Button, Card, Form, Input, Modal, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  const { message, modal } = App.useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRow["role"] | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<UserRow["status"] | "ALL">("ALL");

  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm] = Form.useForm();

  async function onEditSubmit(values: {
    name?: string;
    email?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "USER";
    status?: "ACTIVE" | "INACTIVE";
    password?: string;
  }) {
    if (!editingUser) return;

    setEditSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
      };
      if (values.password) payload.password = values.password;

      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse<CreateUserResponse>;

      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Update user failed");
        return;
      }

      message.success("User updated");
      setEditOpen(false);
      setEditingUser(null);
      editForm.resetFields();
      router.refresh();
    } finally {
      setEditSubmitting(false);
    }
  }

  function openEdit(user: UserRow) {
    setEditingUser(user);
    setEditOpen(true);
    editForm.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
    });
  }

  function confirmDelete(user: UserRow) {
    modal.confirm({
      title: "Delete user?",
      content: `Are you sure you want to delete ${user.name}?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      async onOk() {
        const res = await fetch(`/api/users/${user._id}`, { method: "DELETE" });
        const json = (await res.json()) as ApiResponse<{ ok: true }>;
        if (!res.ok || !json.success) {
          message.error(!json.success ? json.error.message : "Delete user failed");
          return;
        }

        message.success("User deleted");
        router.refresh();
      },
    });
  }

  const columns: ColumnsType<UserRow> = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Role", dataIndex: "role" },
    { title: "Status", dataIndex: "status" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => confirmDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return props.users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
      if (!q) return true;

      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [props.users, query, roleFilter, statusFilter]);

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
        <Space style={{ width: "100%", marginBottom: 12 }} wrap>
          <Input
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
          <Select
            value={roleFilter}
            onChange={(v) => setRoleFilter(v)}
            style={{ width: 160 }}
            options={[
              { value: "ALL", label: "All roles" },
              { value: "USER", label: "USER" },
              { value: "ADMIN", label: "ADMIN" },
              { value: "SUPER_ADMIN", label: "SUPER_ADMIN" },
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            style={{ width: 160 }}
            options={[
              { value: "ALL", label: "All status" },
              { value: "ACTIVE", label: "ACTIVE" },
              { value: "INACTIVE", label: "INACTIVE" },
            ]}
          />
          <Button
            onClick={() => {
              setQuery("");
              setRoleFilter("ALL");
              setStatusFilter("ALL");
            }}
          >
            Clear
          </Button>
        </Space>
        <Table
          rowKey={(r) => r._id}
          columns={columns}
          dataSource={filteredUsers}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title="Create User"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
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

      <Modal
        title={editingUser ? `Edit User: ${editingUser.name}` : "Edit User"}
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={onEditSubmit}
          initialValues={{ role: "USER", status: "ACTIVE" }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Enter user name" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="Enter email" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="New Password" rules={[{ min: 6 }]}>
            <Input.Password placeholder="Leave blank to keep current" autoComplete="new-password" />
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

          <Button type="primary" htmlType="submit" block loading={editSubmitting}>
            Save
          </Button>
        </Form>
      </Modal>
    </AppShell>
  );
}
