"use client";

import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tooltip, Tag, Empty, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ExpandableConfig } from "antd/es/table/interface";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/ui/layouts/AppShell";
import { MarathiTransliterateInput } from "@/ui/components/MarathiTransliterateInput";
import { UserRole } from "@/server/models/types";
import "@/styles/action-buttons.css";

type ApiErrorShape = { code: string; message: string; details?: unknown };
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorShape };

type VillageRow = {
  _id: string;
  name: string;
  district: string;
  taluka: string;
  code: string;
  status: "ACTIVE" | "INACTIVE";
  users?: UserRow[];
};

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
};

type CreateVillageResponse = { village: VillageRow };

type GetVillageUsersResponse = { userIds: string[] };

export function SuperAdminVillagesClient(props: { villages: VillageRow[]; users: UserRow[] }) {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [villages, setVillages] = useState<VillageRow[]>(props.villages);

  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [usersModalVillageId, setUsersModalVillageId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loadingVillageUsers, setLoadingVillageUsers] = useState(false);
  const [savingVillageUsers, setSavingVillageUsers] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteVillageId, setDeleteVillageId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingVillage, setDeletingVillage] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");

  // State for remove user functionality
  const [removeUserModalOpen, setRemoveUserModalOpen] = useState(false);
  const [villageToRemoveUserFrom, setVillageToRemoveUserFrom] = useState<VillageRow | null>(null);
  const [userToRemoveFromVillage, setUserToRemoveFromVillage] = useState<UserRow | null>(null);
  const [removingUserFromVillage, setRemovingUserFromVillage] = useState(false);

  // State for pagination in expanded rows
  const [expandedRowPagination, setExpandedRowPagination] = useState<Record<string, { current: number; pageSize: number }>>({});

  // State for controlling expanded rows (accordion behavior)
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const filteredVillages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return villages;
    return villages.filter((v) =>
      v.name.toLowerCase().includes(q) ||
      v.taluka.toLowerCase().includes(q) ||
      v.district.toLowerCase().includes(q)
    );
  }, [villages, query]);

  const userOptions = useMemo(
    () =>
      props.users
        .filter((u) => u.role !== "SUPER_ADMIN" && u.status === "ACTIVE")
        .map((u) => ({ value: u._id, label: `${u.name} (${u.email})` })),
    [props.users],
  );

  async function refreshVillages() {
    const res = await fetch("/api/villages");
    const json = (await res.json()) as ApiResponse<{ villages: VillageRow[] }>;

    if (!res.ok || !json.success) {
      message.error(!json.success ? json.error.message : "Failed to load villages");
      return;
    }

    setVillages(
      json.data.villages.map((v) => ({
        _id: String(v._id),
        name: v.name,
        district: v.district,
        taluka: v.taluka,
        code: v.code,
        status: v.status,
      })),
    );
  }

  async function onCreateVillage(values: { name: string; taluka: string; district: string }) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/villages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = (await res.json()) as ApiResponse<CreateVillageResponse>;

      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Create village failed");
        return;
      }

      message.success("Village created");
      setCreateModalOpen(false);
      form.resetFields();
      await refreshVillages();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function openManageUsers(villageId: string) {
    setUsersModalOpen(true);
    setUsersModalVillageId(villageId);
    setLoadingVillageUsers(true);

    try {
      const res = await fetch(`/api/villages/${villageId}/users`);
      const json = (await res.json()) as ApiResponse<GetVillageUsersResponse>;

      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Failed to load village users");
        setSelectedUserIds([]);
        return;
      }

      setSelectedUserIds(json.data.userIds);
    } finally {
      setLoadingVillageUsers(false);
    }
  }

  function openDeleteVillage(villageId: string) {
    setDeleteModalOpen(true);
    setDeleteVillageId(villageId);
    setDeleteConfirmText("");
  }

  async function confirmDeleteVillage(villageId: string) {
    setDeletingVillage(true);
    try {
      const res = await fetch(`/api/villages/${villageId}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ ok: true }>;

      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Failed to delete village");
        return;
      }

      message.success("Village deleted");
      setDeleteModalOpen(false);
      setDeleteVillageId(null);
      setDeleteConfirmText("");
      await refreshVillages();
      router.refresh();
    } finally {
      setDeletingVillage(false);
    }
  }

  async function saveVillageUsers() {
    if (!usersModalVillageId) return;

    setSavingVillageUsers(true);
    try {
      const res = await fetch(`/api/villages/${usersModalVillageId}/users`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });

      const json = (await res.json()) as ApiResponse<{ ok: true }>;

      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Failed to save village users");
        return;
      }

      message.success("Users attached");
      setUsersModalOpen(false);
      setUsersModalVillageId(null);
      await refreshVillages();
      router.refresh();
    } finally {
      setSavingVillageUsers(false);
    }
  }

  async function removeUserFromVillage(villageId: string, userId: string) {
    setRemovingUserFromVillage(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "remove-village" }),
      });

      const json = (await res.json()) as ApiResponse<{ ok: true }>;
      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Failed to remove user from village");
        return;
      }

      message.success("User removed from village successfully");
      setRemoveUserModalOpen(false);
      setVillageToRemoveUserFrom(null);
      setUserToRemoveFromVillage(null);
      await refreshVillages();
      router.refresh();
    } catch (error) {
      message.error("Failed to remove user from village");
    } finally {
      setRemovingUserFromVillage(false);
    }
  }

  // Expanded row component for village users
  const ExpandedRowComponent = ({ record }: { record: VillageRow }) => {
    const villageUsers = record.users || [];
    const paginationState = expandedRowPagination[record._id] || { current: 1, pageSize: 5 };

    const startIndex = (paginationState.current - 1) * paginationState.pageSize;
    const endIndex = startIndex + paginationState.pageSize;
    const paginatedUsers = villageUsers.slice(startIndex, endIndex);

    const userColumns: ColumnsType<UserRow> = [
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Email", dataIndex: "email", key: "email" },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (role: string) => (
          <Tag color={role === "SUPER_ADMIN" ? "red" : role === "ADMIN" ? "blue" : "green"}>
            {role}
          </Tag>
        )
      },
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
      {
        title: "Actions",
        key: "actions",
        render: (_, user) => (
          <Button
            type="default"
            danger
            size="small"
            onClick={() => {
              setVillageToRemoveUserFrom(record);
              setUserToRemoveFromVillage(user);
              setRemoveUserModalOpen(true);
            }}
            className="action-button action-button-scale delete-button"
          >
            Remove from Village
          </Button>
        ),
      },
    ];

    if (villageUsers.length === 0) {
      return (
        <Card
          title="Assigned Users"
          style={{ margin: "16px 0" }}
          extra={<Tag color="default">No users assigned</Tag>}
        >
          <Empty
            description="No users are currently assigned to this village"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    return (
      <Card
        title={`Assigned Users (${villageUsers.length})`}
        style={{ margin: "16px 0" }}
        extra={
          villageUsers.length > 5 && (
            <Pagination
              current={paginationState.current}
              pageSize={paginationState.pageSize}
              total={villageUsers.length}
              onChange={(page, pageSize) => {
                setExpandedRowPagination(prev => ({
                  ...prev,
                  [record._id]: { current: page, pageSize: pageSize || 5 }
                }));
              }}
              showSizeChanger={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} users`}
            />
          )
        }
      >
        <Table
          columns={userColumns}
          dataSource={paginatedUsers}
          rowKey={(user) => user._id}
          pagination={false}
          size="small"
          scroll={{ x: 600 }} // Horizontal scroll for user table on mobile
        />
      </Card>
    );
  };

  // Expandable configuration for table
  const expandableConfig: ExpandableConfig<VillageRow> = {
    expandedRowRender: (record) => <ExpandedRowComponent record={record} />,
    rowExpandable: (record) => true, // All rows are expandable
    expandedRowKeys,
    onExpandedRowsChange: (keys) => {
      // Accordion behavior: only allow one row to be expanded at a time
      if (keys.length > 1) {
        // Keep only the last expanded row
        setExpandedRowKeys([keys[keys.length - 1]]);
      } else {
        setExpandedRowKeys(keys as React.Key[]);
      }
    },
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
    expandRowByClick: false, // Disable row click expansion - only chevron clickable
  };

  const columns: ColumnsType<VillageRow> = [
    { title: "Name", dataIndex: "name" },
    { title: "Taluka", dataIndex: "taluka" },
    { title: "District", dataIndex: "district" },
    { title: "Code", dataIndex: "code" },
    { title: "Status", dataIndex: "status" },
    {
      title: "Actions",
      render: (_, row) => (
        <Space>
          <Tooltip title="View Village Dashboard">
            <Button
              type="primary"
              size="small"
              onClick={() => router.push(`/superadmin/villages/${row._id}`)}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Manage users assigned to this village">
            <Button
              type="default"
              size="small"
              onClick={() => openManageUsers(row._id)}
              className="action-button action-button-scale attach-users-button"
            >
              Attach Users
            </Button>
          </Tooltip>
          <Tooltip title="Permanently delete this village and all associated data">
            <Button
              type="default"
              danger
              size="small"
              onClick={() => openDeleteVillage(row._id)}
              className="action-button action-button-scale delete-button"
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AppShell
      title="Villages"
      role={UserRole.SUPER_ADMIN}
    >
      <Card title="Villages" extra={
        <Button type="primary" onClick={() => setCreateModalOpen(true)}>
          Create Village
        </Button>
      }>
        <Space style={{ width: "100%", marginBottom: 12 }} wrap>
          <Input
            placeholder="Search by name, taluka, or district"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            allowClear
            style={{ width: 250, minWidth: 150 }} // Responsive width
          />
          <Button onClick={() => setQuery("")}>Clear</Button>
        </Space>
        <Table
          rowKey={(r) => r._id}
          columns={columns}
          dataSource={filteredVillages}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            simple: true, // Use simple pagination on mobile
            responsive: true
          }}
          expandable={expandableConfig}
          scroll={{ x: 800 }} // Enable horizontal scrolling on mobile
          size="small" // Use smaller size on mobile
        />
      </Card>

      <Modal
        title="Create Village"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onCreateVillage}>
          <Form.Item
            name="name"
            label="Village Name"
            rules={[{ required: true }]}
            valuePropName="value"
            trigger="onChange"
            getValueFromEvent={(v) => v}
          >
            <MarathiTransliterateInput placeholder="Type village name" />
          </Form.Item>
          <Form.Item
            name="taluka"
            label="Taluka"
            rules={[{ required: true }]}
            valuePropName="value"
            trigger="onChange"
            getValueFromEvent={(v) => v}
          >
            <MarathiTransliterateInput placeholder="Type taluka" />
          </Form.Item>
          <Form.Item
            name="district"
            label="District"
            rules={[{ required: true }]}
            valuePropName="value"
            trigger="onChange"
            getValueFromEvent={(v) => v}
          >
            <MarathiTransliterateInput placeholder="Type district" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={submitting}>
            Create
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Attach Users"
        open={usersModalOpen}
        onCancel={() => {
          setUsersModalOpen(false);
          setUsersModalVillageId(null);
        }}
        onOk={saveVillageUsers}
        okText="Save"
        confirmLoading={savingVillageUsers}
      >
        <Form layout="vertical">
          <Form.Item label="Users">
            <Select
              mode="multiple"
              placeholder={loadingVillageUsers ? "Loading..." : "Select users"}
              loading={loadingVillageUsers}
              disabled={loadingVillageUsers}
              value={selectedUserIds}
              onChange={setSelectedUserIds}
              options={userOptions}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Delete Village"
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteVillageId(null);
          setDeleteConfirmText("");
        }}
        okText="Delete"
        okButtonProps={{ danger: true, disabled: deleteConfirmText !== "delete" }}
        confirmLoading={deletingVillage}
        onOk={() => {
          if (deleteVillageId) {
            confirmDeleteVillage(deleteVillageId);
          }
        }}
      >
        <div style={{ marginBottom: 12 }}>
          Are you sure you want to delete this village? Confirm by typing <b>delete</b> below.
        </div>
        <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
      </Modal>

      {/* Remove User from Village Modal */}
      <Modal
        title="Remove User from Village"
        open={removeUserModalOpen}
        onCancel={() => {
          setRemoveUserModalOpen(false);
          setVillageToRemoveUserFrom(null);
          setUserToRemoveFromVillage(null);
        }}
        okText="Remove"
        okButtonProps={{ danger: true }}
        confirmLoading={removingUserFromVillage}
        onOk={() => {
          if (villageToRemoveUserFrom && userToRemoveFromVillage) {
            removeUserFromVillage(villageToRemoveUserFrom._id, userToRemoveFromVillage._id);
          }
        }}
      >
        <div style={{ marginBottom: 12 }}>
          Are you sure you want to remove <b>{userToRemoveFromVillage?.name}</b> from village <b>{villageToRemoveUserFrom?.name}</b>?
        </div>
        <div style={{ marginBottom: 12 }}>
          <p><strong>User Details:</strong></p>
          <p>Name: {userToRemoveFromVillage?.name}</p>
          <p>Email: {userToRemoveFromVillage?.email}</p>
          <p>Role: {userToRemoveFromVillage?.role}</p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <p><strong>Village Details:</strong></p>
          <p>Name: {villageToRemoveUserFrom?.name}</p>
          <p>District: {villageToRemoveUserFrom?.district}</p>
          <p>Taluka: {villageToRemoveUserFrom?.taluka}</p>
        </div>
        <div style={{ color: "#ff4d4f", fontSize: "12px" }}>
          This will remove the user's access to this village. The user will no longer be able to manage or view data for this village.
        </div>
      </Modal>
    </AppShell>
  );
}
