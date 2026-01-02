"use client";

import { App, Button, Card, Form, Input, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/ui/layouts/AppShell";
import { MarathiTransliterateInput } from "@/ui/components/MarathiTransliterateInput";

type ApiErrorShape = { code: string; message: string; details?: unknown };
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorShape };

type RateRow = {
  _id: string;
  waterTaxTypeMr: string;
  rate: number;
  effectiveFrom: string;
};

export function SuperAdminGlobalWaterSupplyTaxRatesClient(props: { rates: RateRow[] }) {
  const router = useRouter();
  const { message, modal } = App.useApp();

  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<RateRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const filteredRates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return props.rates;
    return props.rates.filter((r) => r.waterTaxTypeMr.toLowerCase().includes(q));
  }, [props.rates, query]);

  async function refresh() {
    router.refresh();
  }

  async function createRate(values: { waterTaxTypeMr: string; rate: number; effectiveFrom: string }) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/global-rates/water-supply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = (await res.json()) as ApiResponse<{ rate: RateRow }>;
      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Failed");
        return;
      }

      message.success("जतन झाले");
      setCreateOpen(false);
      createForm.resetFields();
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(row: RateRow) {
    setEditing(row);
    setEditOpen(true);
    editForm.setFieldsValue({
      waterTaxTypeMr: row.waterTaxTypeMr,
      rate: row.rate,
      effectiveFrom: row.effectiveFrom.slice(0, 10),
    });
  }

  async function saveEdit(values: { waterTaxTypeMr?: string; rate?: number; effectiveFrom?: string }) {
    if (!editing) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/global-rates/water-supply/${editing._id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = (await res.json()) as ApiResponse<{ rate: RateRow }>;
      if (!res.ok || !json.success) {
        message.error(!json.success ? json.error.message : "Failed");
        return;
      }

      message.success("जतन झाले");
      setEditOpen(false);
      setEditing(null);
      editForm.resetFields();
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(row: RateRow) {
    modal.confirm({
      title: "हटवायचे?",
      content: row.waterTaxTypeMr,
      okText: "हटवा",
      okButtonProps: { danger: true },
      cancelText: "रद्द",
      async onOk() {
        const res = await fetch(`/api/global-rates/water-supply/${row._id}`, {
          method: "DELETE",
        });
        const json = (await res.json()) as ApiResponse<{ ok: true }>;
        if (!res.ok || !json.success) {
          message.error(!json.success ? json.error.message : "Failed");
          return;
        }
        message.success("हटवले");
        await refresh();
      },
    });
  }

  const columns: ColumnsType<RateRow> = [
    { title: "पाणी कर प्रकार", dataIndex: "waterTaxTypeMr" },
    { title: "दर", dataIndex: "rate" },
    {
      title: "प्रभावी दिनांक",
      dataIndex: "effectiveFrom",
      render: (v: string) => v.slice(0, 10),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, row) => (
        <Space>
          <Button type="link" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => confirmDelete(row)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppShell title="कराचे दर (ग्लोबल)" role="SUPER_ADMIN">
      <Card
        title="पाणी पुरवठा कराचे दर"
        extra={
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            नवीन
          </Button>
        }
      >
        <Space style={{ width: "100%", marginBottom: 12 }} wrap>
          <Input
            placeholder="प्रकार शोधा (उदा: साधारण)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            allowClear
            style={{ width: 320 }}
          />
        </Space>

        <Table
          rowKey={(r) => r._id}
          columns={columns}
          dataSource={filteredRates}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal title="नवीन दर" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null}>
        <Form
          form={createForm}
          layout="vertical"
          onFinish={createRate}
          initialValues={{ effectiveFrom: new Date().toISOString().slice(0, 10) }}
        >
          <Form.Item name="waterTaxTypeMr" label="पाणी कर प्रकार" rules={[{ required: true }]}>
            <MarathiTransliterateInput placeholder="साधारण पाणी कर / विशेष पाणी कर" />
          </Form.Item>
          <Form.Item name="rate" label="दर" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="effectiveFrom" label="प्रभावी दिनांक" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={submitting}>
            जतन करा
          </Button>
        </Form>
      </Modal>

      <Modal
        title="दर बदला"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditing(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={saveEdit}>
          <Form.Item name="waterTaxTypeMr" label="पाणी कर प्रकार" rules={[{ required: true }]}>
            <MarathiTransliterateInput placeholder="पाणी कर प्रकार" />
          </Form.Item>
          <Form.Item name="rate" label="दर" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="effectiveFrom" label="प्रभावी दिनांक" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={submitting}>
            जतन करा
          </Button>
        </Form>
      </Modal>
    </AppShell>
  );
}
