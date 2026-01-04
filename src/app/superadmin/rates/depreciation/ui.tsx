"use client";

import { App, Button, Card, Form, Input, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";


import { AppShell } from "@/ui/layouts/AppShell";
import { UserRole } from "@/server/models/types";


type ApiErrorShape = { code: string; message: string; details?: unknown };
type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: ApiErrorShape };

type DepreciationRow = {
    _id: string;
    ageFromYear: number;
    ageToYear: number | null;
    depreciationRate: number;
    effectiveFrom: string;
};

function ageLabel(r: DepreciationRow) {
    const from = r.ageFromYear;
    const to = r.ageToYear;

    if (to == null) return `${from} वर्षे आणि त्यापुढे`;
    return `${from} वर्षे ते ${to} वर्षे`;
}

export function SuperAdminDepreciationRatesClient(props: { rates: DepreciationRow[] }) {
    const router = useRouter();
    const { message, modal } = App.useApp();

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<DepreciationRow | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const sortedRates = useMemo(() => {
        return [...props.rates].sort((a, b) => {
            // Sort by effectiveFrom desc, then ageFrom asc
            const dateDiff = new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime();
            if (dateDiff !== 0) return dateDiff;
            return a.ageFromYear - b.ageFromYear;
        });
    }, [props.rates]);

    async function refresh() {
        router.refresh();
    }

    async function createRate(values: {
        ageFromYear: number;
        ageToYear?: number | null;
        depreciationRate: number;
        effectiveFrom: string;
    }) {
        setSubmitting(true);
        try {
            const payload = {
                ageFromYear: values.ageFromYear,
                ageToYear:
                    values.ageToYear == null || values.ageToYear === ("" as unknown as number)
                        ? null
                        : values.ageToYear,
                depreciationRate: values.depreciationRate,
                effectiveFrom: values.effectiveFrom,
            };

            const res = await fetch("/api/global-rates/depreciation", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = (await res.json()) as ApiResponse<{ rate: DepreciationRow }>;
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

    function openEdit(row: DepreciationRow) {
        setEditing(row);
        setEditOpen(true);
        editForm.setFieldsValue({
            ageFromYear: row.ageFromYear,
            ageToYear: row.ageToYear,
            depreciationRate: row.depreciationRate,
            effectiveFrom: row.effectiveFrom.slice(0, 10),
        });
    }

    async function saveEdit(values: {
        ageFromYear?: number;
        ageToYear?: number | null;
        depreciationRate?: number;
        effectiveFrom?: string;
    }) {
        if (!editing) return;

        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = {};
            if (values.ageFromYear != null) payload.ageFromYear = values.ageFromYear;
            if (values.ageToYear !== undefined) {
                payload.ageToYear = values.ageToYear == null ? null : values.ageToYear;
            }
            if (values.depreciationRate != null) payload.depreciationRate = values.depreciationRate;
            if (values.effectiveFrom != null) payload.effectiveFrom = values.effectiveFrom;

            const res = await fetch(`/api/global-rates/depreciation/${editing._id}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = (await res.json()) as ApiResponse<{ rate: DepreciationRow }>;
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

    function confirmDelete(row: DepreciationRow) {
        modal.confirm({
            title: "हटवायचे?",
            content: ageLabel(row),
            okText: "हटवा",
            okButtonProps: { danger: true },
            cancelText: "रद्द",
            async onOk() {
                const res = await fetch(`/api/global-rates/depreciation/${row._id}`, {
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

    const columns: ColumnsType<DepreciationRow> = [
        {
            title: "कलावधी (Building Age)",
            key: "ageRange",
            render: (_: unknown, r) => ageLabel(r),
        },
        { title: "घसारा दर (%)", dataIndex: "depreciationRate" },
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
                title="इमारतीचे आयुष्य (वय) नुसार घसारी दर"
                extra={
                    <Button type="primary" onClick={() => setCreateOpen(true)}>
                        नवीन
                    </Button>
                }
            >
                <Table
                    rowKey={(r) => r._id}
                    columns={columns}
                    dataSource={sortedRates}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                />
            </Card>

            <Modal title="नवीन घसारी दर" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null}>
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={createRate}
                    initialValues={{ effectiveFrom: new Date().toISOString().slice(0, 10) }}
                >
                    <Form.Item name="ageFromYear" label="पासून (वर्षे)" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="ageToYear" label="पर्यंत (वर्षे) (रिकामे = त्यापुढे)" rules={[]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="depreciationRate" label="घसारा दर (%)" rules={[{ required: true }]}>
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
                title="घसारी दर बदला"
                open={editOpen}
                onCancel={() => {
                    setEditOpen(false);
                    setEditing(null);
                    editForm.resetFields();
                }}
                footer={null}
            >
                <Form form={editForm} layout="vertical" onFinish={saveEdit}>
                    <Form.Item name="ageFromYear" label="पासून (वर्षे)" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="ageToYear" label="पर्यंत (वर्षे) (रिकामे = त्यापुढे)" rules={[]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="depreciationRate" label="घसारा दर (%)" rules={[{ required: true }]}>
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
