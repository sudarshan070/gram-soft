"use client";

import { App, Button, Card, Form, Input, Modal, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/ui/layouts/AppShell";
import { UserRole } from "@/server/models/types";

type ApiErrorShape = { code: string; message: string; details?: unknown };
type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: ApiErrorShape };

type UsageRow = {
    _id: string;
    usageTypeMr: string;
    weightage: number;
    effectiveFrom: string;
};

const USAGE_TYPE_OPTIONS = [
    { label: "निवासी (Residential)", value: "निवासी" },
    { label: "व्यावसायिक (Commercial)", value: "व्यावसायिक" },
    { label: "औद्योगिक (Industrial)", value: "औद्योगिक" },
    { label: "मिश्र (Mixed)", value: "मिश्र" },
    { label: "शासकीय (Government)", value: "शासकीय" },
];

export function SuperAdminUsageFactorsClient(props: { rates: UsageRow[] }) {
    const router = useRouter();
    const { message, modal } = App.useApp();

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<UsageRow | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [query, setQuery] = useState("");

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const filteredRates = useMemo(() => {
        return props.rates.filter((r) => r.usageTypeMr.includes(query));
    }, [props.rates, query]);

    async function refresh() {
        router.refresh();
    }

    async function createRate(values: {
        usageTypeMr: string;
        weightage: number;
        effectiveFrom: string;
    }) {
        setSubmitting(true);
        try {
            const payload = {
                usageTypeMr: values.usageTypeMr,
                weightage: values.weightage,
                effectiveFrom: values.effectiveFrom,
            };

            const res = await fetch("/api/global-rates/usage-factor", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = (await res.json()) as ApiResponse<{ rate: UsageRow }>;
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

    function openEdit(row: UsageRow) {
        setEditing(row);
        setEditOpen(true);
        editForm.setFieldsValue({
            usageTypeMr: row.usageTypeMr,
            weightage: row.weightage,
            effectiveFrom: row.effectiveFrom.slice(0, 10),
        });
    }

    async function saveEdit(values: {
        usageTypeMr?: string;
        weightage?: number;
        effectiveFrom?: string;
    }) {
        if (!editing) return;

        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = {};
            if (values.usageTypeMr != null) payload.usageTypeMr = values.usageTypeMr;
            if (values.weightage != null) payload.weightage = values.weightage;
            if (values.effectiveFrom != null) payload.effectiveFrom = values.effectiveFrom;

            const res = await fetch(`/api/global-rates/usage-factor/${editing._id}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = (await res.json()) as ApiResponse<{ rate: UsageRow }>;
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

    function confirmDelete(row: UsageRow) {
        modal.confirm({
            title: "हटवायचे?",
            content: row.usageTypeMr,
            okText: "हटवा",
            okButtonProps: { danger: true },
            cancelText: "रद्द",
            async onOk() {
                const res = await fetch(`/api/global-rates/usage-factor/${row._id}`, {
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

    const columns: ColumnsType<UsageRow> = [
        {
            title: "वापर प्रकार (Usage Type)",
            dataIndex: "usageTypeMr",
            key: "usageType",
        },
        { title: "भारांक (Weightage)", dataIndex: "weightage" },
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
        <AppShell title="कराचे दर (ग्लोबल)" role={UserRole.SUPER_ADMIN}>
            <Card
                title="इमारतीचा वापर आणि भारांक"
                extra={
                    <Button type="primary" onClick={() => setCreateOpen(true)}>
                        नवीन
                    </Button>
                }
            >
                <Space style={{ width: "100%", marginBottom: 12 }} wrap>
                    <Input
                        placeholder="वापर प्रकार शोधा (उदा: निवासी)"
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

            <Modal title="नवीन वापर भारांक" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null}>
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={createRate}
                    initialValues={{ effectiveFrom: new Date().toISOString().slice(0, 10) }}
                >
                    <Form.Item name="usageTypeMr" label="वापर प्रकार (मराठीत)" rules={[{ required: true }]}>
                        <Select options={USAGE_TYPE_OPTIONS} />
                    </Form.Item>
                    <Form.Item name="weightage" label="भारांक (Weightage)" rules={[{ required: true }]}>
                        <Input type="number" step="0.01" />
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
                title="वापर भारांक बदला"
                open={editOpen}
                onCancel={() => {
                    setEditOpen(false);
                    setEditing(null);
                    editForm.resetFields();
                }}
                footer={null}
            >
                <Form form={editForm} layout="vertical" onFinish={saveEdit}>
                    <Form.Item name="usageTypeMr" label="वापर प्रकार (मराठीत)" rules={[{ required: true }]}>
                        <Select options={USAGE_TYPE_OPTIONS} />
                    </Form.Item>
                    <Form.Item name="weightage" label="भारांक (Weightage)" rules={[{ required: true }]}>
                        <Input type="number" step="0.01" />
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
