"use client";

import { Button, Card, Form, Input, Modal, Select, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/ui/layouts/AppShell";
import { MarathiTransliterateInput } from "@/ui/components/MarathiTransliterateInput";

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
    form.resetFields();
    await refreshVillages();
    router.refresh();
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
    } finally {
      setSavingVillageUsers(false);
    }
  }

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
          <Button onClick={() => openManageUsers(row._id)}>Attach Users</Button>
          <Button danger onClick={() => openDeleteVillage(row._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppShell
      title="Villages"
      menuItems={[
        { key: "dash", label: "Dashboard", href: "/superadmin/dashboard" },
        { key: "users", label: "Users", href: "/superadmin/users" },
        { key: "new-user", label: "Create User", href: "/superadmin/users/new" },
        { key: "villages", label: "Villages", href: "/superadmin/villages" },
      ]}
    >
      <Card title="Create Village" style={{ maxWidth: 520, marginBottom: 16 }}>
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

          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form>
      </Card>

      <Card title="Villages">
        <Table
          rowKey={(r) => r._id}
          columns={columns}
          dataSource={villages}
          pagination={{ pageSize: 10 }}
        />
      </Card>

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
    </AppShell>
  );
}
