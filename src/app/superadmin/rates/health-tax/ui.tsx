"use client";

import { App, Button, Card, Form, Input, Modal, Segmented, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/ui/layouts/AppShell";

type ApiErrorShape = { code: string; message: string; details?: unknown };
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorShape };

type SlabRow = {
  _id: string;
  slabFromSqFt: number;
  slabToSqFt: number | null;
  rate: number;
  effectiveFrom: string;
};

type AreaUnit = "SQFT" | "SQM";

const SQM_TO_SQFT = 10.763910416709722;

function toDisplayAreaSq(unit: AreaUnit, sqFt: number) {
  if (unit === "SQFT") return sqFt;
  return sqFt / SQM_TO_SQFT;
}

function toStoredSqFt(unit: AreaUnit, display: number) {
  if (unit === "SQFT") return display;
  return display * SQM_TO_SQFT;
}

function unitLabel(unit: AreaUnit) {
  return unit === "SQFT" ? "चौ.फुट" : "चौ.मीटर";
}

function slabLabel(r: SlabRow, unit: AreaUnit) {
  const from = toDisplayAreaSq(unit, r.slabFromSqFt);
  const to = r.slabToSqFt == null ? null : toDisplayAreaSq(unit, r.slabToSqFt);

  const fmt = (n: number) => {
    const rounded = Math.round(n * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  };

  if (to == null) return `${fmt(from)} ${unitLabel(unit)} आणि त्यांचं वर`;
  return `${fmt(from)} ${unitLabel(unit)} ते ${fmt(to)} ${unitLabel(unit)} पर्यंत`;
}

export function SuperAdminHealthTaxSlabsClient(props: { rates: SlabRow[] }) {
  const router = useRouter();
  const { message, modal } = App.useApp();

  const [unit, setUnit] = useState<AreaUnit>("SQFT");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<SlabRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const filteredRates = useMemo(() => {
    const q = query.trim();
    if (!q) return props.rates;
    return props.rates.filter((r) => slabLabel(r, unit).includes(q));
  }, [props.rates, query, unit]);

  async function refresh() {
    router.refresh();
  }

  async function createRate(values: {
    slabFrom: number;
    slabTo?: number | null;
    rate: number;
    effectiveFrom: string;
  }) {
    setSubmitting(true);
    try {
      const payload = {
        slabFromSqFt: toStoredSqFt(unit, values.slabFrom),
        slabToSqFt: values.slabTo == null || values.slabTo === ("" as unknown as number) ? null : toStoredSqFt(unit, values.slabTo),
        rate: values.rate,
        effectiveFrom: values.effectiveFrom,
      };

      const res = await fetch("/api/global-rates/health-tax-slabs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse<{ rate: SlabRow }>;
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

  function openEdit(row: SlabRow) {
    setEditing(row);
    setEditOpen(true);
    editForm.setFieldsValue({
      slabFrom: toDisplayAreaSq(unit, row.slabFromSqFt),
      slabTo: row.slabToSqFt == null ? undefined : toDisplayAreaSq(unit, row.slabToSqFt),
      rate: row.rate,
      effectiveFrom: row.effectiveFrom.slice(0, 10),
    });
  }

  async function saveEdit(values: {
    slabFrom?: number;
    slabTo?: number | null;
    rate?: number;
    effectiveFrom?: string;
  }) {
    if (!editing) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {};
      if (values.slabFrom != null) payload.slabFromSqFt = toStoredSqFt(unit, values.slabFrom);
      if (values.slabTo !== undefined) {
        payload.slabToSqFt = values.slabTo == null ? null : toStoredSqFt(unit, values.slabTo);
      }
      if (values.rate != null) payload.rate = values.rate;
      if (values.effectiveFrom != null) payload.effectiveFrom = values.effectiveFrom;

      const res = await fetch(`/api/global-rates/health-tax-slabs/${editing._id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse<{ rate: SlabRow }>;
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

  function confirmDelete(row: SlabRow) {
    modal.confirm({
      title: "हटवायचे?",
      content: slabLabel(row, unit),
      okText: "हटवा",
      okButtonProps: { danger: true },
      cancelText: "रद्द",
      async onOk() {
        const res = await fetch(`/api/global-rates/health-tax-slabs/${row._id}`, {
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

  const columns: ColumnsType<SlabRow> = [
    {
      title: "Slab",
      key: "slab",
      render: (_: unknown, r) => slabLabel(r, unit),
    },
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
        title="आरोग्य कराचे दर (Slab)"
        extra={
          <Space wrap>
            <Segmented
              value={unit}
              options={[
                { label: "Sq Ft", value: "SQFT" },
                { label: "Sq Meter", value: "SQM" },
              ]}
              onChange={(v) => {
                const next = v as AreaUnit;
                setUnit(next);
                setCreateOpen(false);
                setEditOpen(false);
                setEditing(null);
                createForm.resetFields();
                editForm.resetFields();
              }}
            />
            <Button type="primary" onClick={() => setCreateOpen(true)}>
              नवीन
            </Button>
          </Space>
        }
      >
        <Space style={{ width: "100%", marginBottom: 12 }} wrap>
          <Input
            placeholder={`Slab शोधा (उदा: 0 ${unitLabel(unit)})`}
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

      <Modal title="नवीन Slab" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null}>
        <Form
          form={createForm}
          layout="vertical"
          onFinish={createRate}
          initialValues={{ effectiveFrom: new Date().toISOString().slice(0, 10) }}
        >
          <Form.Item name="slabFrom" label={`पासून (${unitLabel(unit)})`} rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="slabTo" label={`पर्यंत (${unitLabel(unit)}) (रिकामे = वर)`} rules={[]}>
            <Input type="number" />
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
        title="Slab बदला"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditing(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={saveEdit}>
          <Form.Item name="slabFrom" label={`पासून (${unitLabel(unit)})`} rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="slabTo" label={`पर्यंत (${unitLabel(unit)}) (रिकामे = वर)`} rules={[]}>
            <Input type="number" />
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
