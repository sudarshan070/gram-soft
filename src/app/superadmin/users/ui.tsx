"use client";

import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tooltip, Empty, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ExpandableConfig } from "antd/es/table/interface";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { AppShell } from "@/ui/layouts/AppShell";
import { UserRole, Status } from "@/server/models/types";
import "@/styles/action-buttons.css";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: Status;
  villageId?: string | null;
  village?: {
    _id: string;
    name: string;
    taluka: string;
    district: string;
    code: string;
    status: string;
  } | null;
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

  const [villages, setVillages] = useState<any[]>([]);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [assigningVillage, setAssigningVillage] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);

  const [removeVillageModalOpen, setRemoveVillageModalOpen] = useState(false);
  const [userToRemoveVillageFrom, setUserToRemoveVillageFrom] = useState<UserRow | null>(null);
  const [removingVillage, setRemovingVillage] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm] = Form.useForm();

  // Fetch villages for dropdown
  useEffect(() => {
    async function fetchVillages() {
      setLoadingVillages(true);
      try {
        const res = await fetch("/api/villages");
        const json = await res.json();
        if (json.success && Array.isArray(json.data.villages)) {
          setVillages(json.data.villages);
        } else {
          setVillages([]);
        }
      } catch (error) {
        setVillages([]);
      } finally {
        setLoadingVillages(false);
      }
    }
    fetchVillages();
  }, []);

  async function assignVillageToUser(userId: string, villageId: string) {
    setAssigningVillage(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "assign-village", villageId }),
      });

      const json = (await res.json()) as ApiResponse<{ ok: true }>;
      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Failed to assign village");
        return;
      }

      message.success("Village assigned successfully");
      setSelectedVillage(null);
      router.refresh();
    } catch (error) {
      message.error("Failed to assign village");
    } finally {
      setAssigningVillage(false);
    }
  }

  async function removeVillageFromUser(userId: string) {
    setRemovingVillage(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "remove-village" }),
      });

      const json = (await res.json()) as ApiResponse<{ ok: true }>;
      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Failed to remove village");
        return;
      }

      message.success("Village removed successfully");
      setRemoveVillageModalOpen(false);
      setUserToRemoveVillageFrom(null);
      router.refresh();
    } catch (error) {
      message.error("Failed to remove village");
    } finally {
      setRemovingVillage(false);
    }
  }

  // Expanded row component for village information
  const ExpandedRowComponent = ({ record }: { record: UserRow }) => {
    if (record.village) {
      const villageColumns: ColumnsType<any> = [
        { title: "Village Name", dataIndex: "name", key: "name" },
        { title: "Taluka", dataIndex: "taluka", key: "taluka" },
        { title: "District", dataIndex: "district", key: "district" },
        { title: "Code", dataIndex: "code", key: "code" },
        { 
          title: "Status", 
          dataIndex: "status", 
          key: "status",
          render: (status: string) => (
            <Tag color={status === "ACTIVE" ? "green" : "red"}>
              {status}
            </Tag>
          )
        },
      ];

      return (
        <div style={{ margin: "0 16px 16px 16px" }}>
          <Card 
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#1890ff" }}>📍</span>
                Assigned Village Information
              </div>
            }
            size="small"
            style={{ 
              background: "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)",
              border: "1px solid #91d5ff",
              borderRadius: "8px"
            }}
            extra={
              <Button
                type="primary"
                danger
                size="small"
                onClick={() => {
                  setUserToRemoveVillageFrom(record);
                  setRemoveVillageModalOpen(true);
                }}
                className="action-button delete-button"
              >
                Remove Village
              </Button>
            }
          >
            <Table
              columns={villageColumns}
              dataSource={[record.village]}
              pagination={false}
              size="small"
              rowKey="_id"
            />
          </Card>
        </div>
      );
    }

    return (
      <div style={{ margin: "0 16px 16px 16px" }}>
        <Card 
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#faad14" }}>⚠️</span>
              No Village Assigned
            </div>
          }
          size="small"
          style={{ 
            background: "linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)",
            border: "1px solid #ffd591",
            borderRadius: "8px"
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <p style={{ margin: 0, color: "#8c8c8c" }}>
              This user is not currently assigned to any village. Assign a village to grant access.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Select
              placeholder="Select a village to assign"
              style={{ width: 300 }}
              value={selectedVillage}
              onChange={setSelectedVillage}
              options={Array.isArray(villages) ? villages.map((village) => ({
                label: `${village.name} (${village.district})`,
                value: village._id,
              })) : []}
              size="small"
              loading={loadingVillages}
              disabled={loadingVillages}
            />
            <Button
              type="primary"
              size="small"
              onClick={() => {
                if (selectedVillage) {
                  assignVillageToUser(record._id, selectedVillage);
                }
              }}
              disabled={!selectedVillage || assigningVillage}
              loading={assigningVillage}
              className="action-button edit-button"
            >
              Assign Village
            </Button>
          </div>
        </Card>
      </div>
    );
  };

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
              className="action-button edit-button"
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
              className="action-button delete-button"
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

  // Expandable configuration for the table
  const expandableConfig: ExpandableConfig<UserRow> = {
    expandedRowRender: (record) => <ExpandedRowComponent record={record} />,
    rowExpandable: (record) => true, // All rows are expandable
    expandIcon: ({ expanded, onExpand, record }) => (
      <div
        style={{
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onExpand(record, e);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f9ff';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.3s ease',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            color: '#1890ff',
            fontSize: '12px',
          }}
        >
          ▶
        </span>
      </div>
    ),
    expandRowByClick: true, // Enable row click to expand
  };

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
          expandable={expandableConfig}
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

      <Modal
        title="Remove Village Assignment"
        open={removeVillageModalOpen}
        onCancel={() => {
          setRemoveVillageModalOpen(false);
          setUserToRemoveVillageFrom(null);
        }}
        okText="Remove Village"
        okButtonProps={{ danger: true }}
        confirmLoading={removingVillage}
        onOk={() => {
          if (userToRemoveVillageFrom) {
            removeVillageFromUser(userToRemoveVillageFrom._id);
          }
        }}
      >
        <div style={{ marginBottom: 12 }}>
          Are you sure you want to remove the village assignment from <b>{userToRemoveVillageFrom?.name}</b>?
        </div>
        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: 0, color: "#8c8c8c" }}>
            This will revoke the user's access to <b>{userToRemoveVillageFrom?.village?.name}</b> village.
          </p>
        </div>
        <div style={{ padding: "12px", background: "#fff2f0", border: "1px solid #ffccc7", borderRadius: "6px" }}>
          <span style={{ color: "#ff4d4f" }}>⚠️</span>
          <span style={{ marginLeft: "8px", color: "#ff4d4f" }}>
            The user will lose access to all village-specific features and data.
          </span>
        </div>
      </Modal>
    </AppShell>
  );
}
