"use client";

import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppShell } from "@/ui/layouts/AppShell";
import { UserRole, Status } from "@/server/models/types";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: Status;
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
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingUser, setDeletingUser] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm] = Form.useForm();

  async function onEditSubmit(values: {
    name?: string;
    email?: string;
    role?: UserRole;
    status?: Status;
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
    setDeleteUserId(user._id);
    setDeleteModalOpen(true);
  }

  async function confirmDeleteUser() {
    if (!deleteUserId) return;
    
    setDeletingUser(true);
    try {
      const res = await fetch(`/api/users/${deleteUserId}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ ok: true }>;
      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Delete user failed");
        return;
      }

      message.success("User deleted");
      setDeleteModalOpen(false);
      setDeleteUserId(null);
      setDeleteConfirmText("");
      router.refresh();
    } catch (error) {
      message.error("Delete user failed");
    } finally {
      setDeletingUser(false);
    }
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
          <Tooltip title="Edit user details and permissions">
            <Button 
              type="default" 
              size="small"
              onClick={() => openEdit(record)}
              style={{ 
                border: '1px solid #52c41a',
                background: 'linear-gradient(135deg, #73d13d 0%, #52c41a 100%)',
                boxShadow: '0 2px 0 rgba(82, 196, 26, 0.03)',
                transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.15)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 0 rgba(82, 196, 26, 0.03)';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Permanently delete this user">
            <Button 
              type="default" 
              danger 
              size="small"
              onClick={() => confirmDelete(record)}
              style={{ 
                border: '1px solid #ff4d4f',
                background: 'linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)',
                boxShadow: '0 2px 0 rgba(255, 77, 79, 0.03)',
                transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.15)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 0 rgba(255, 77, 79, 0.03)';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              Delete
            </Button>
          </Tooltip>
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
    role?: UserRole;
    status?: Status;
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
      role={UserRole.SUPER_ADMIN}
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
              { value: UserRole.USER, label: "USER" },
              { value: UserRole.ADMIN, label: "ADMIN" },
              { value: UserRole.SUPER_ADMIN, label: "SUPER_ADMIN" },
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            style={{ width: 160 }}
            options={[
              { value: "ALL", label: "All status" },
              { value: Status.ACTIVE, label: "ACTIVE" },
              { value: Status.INACTIVE, label: "INACTIVE" },
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
          initialValues={{ role: UserRole.USER, status: Status.ACTIVE }}
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
                { value: UserRole.USER, label: "USER" },
                { value: UserRole.ADMIN, label: "ADMIN" },
                { value: UserRole.SUPER_ADMIN, label: "SUPER_ADMIN" },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: Status.ACTIVE, label: "ACTIVE" },
                { value: Status.INACTIVE, label: "INACTIVE" },
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
          initialValues={{ role: UserRole.USER, status: Status.ACTIVE }}
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
                { value: UserRole.USER, label: "USER" },
                { value: UserRole.ADMIN, label: "ADMIN" },
                { value: UserRole.SUPER_ADMIN, label: "SUPER_ADMIN" },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: Status.ACTIVE, label: "ACTIVE" },
                { value: Status.INACTIVE, label: "INACTIVE" },
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={editSubmitting}>
            Save
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Delete User"
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteUserId(null);
          setDeleteConfirmText("");
        }}
        okText="Delete"
        okButtonProps={{ danger: true, disabled: deleteConfirmText !== "delete" }}
        confirmLoading={deletingUser}
        onOk={() => {
          if (deleteUserId) {
            confirmDeleteUser();
          }
        }}
      >
        <div style={{ marginBottom: 12 }}>
          Are you sure you want to delete this user? Confirm by typing <b>delete</b> below.
        </div>
        <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
      </Modal>
    </AppShell>
  );
}
