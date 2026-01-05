"use client";

import { App, Button, Card, Col, Descriptions, Form, Modal, Row, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/ui/layouts/AppShell";
import { MarathiTransliterateInput } from "@/ui/components/MarathiTransliterateInput";
import { UserRole } from "@/server/models/types";

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

export function VillageDashboardClient(props: {
    village: VillageRow & { parentId?: string | null };
    subVillages: VillageRow[];
    parentVillage?: VillageRow | null;
    properties: {
        _id: string;
        propertyNo: string;
        ownerName: string;
        mobile?: string;
    }[];
}) {
    const router = useRouter();
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function refresh() {
        router.refresh();
    }

    async function onCreateSubVillage(values: { name: string; taluka: string; district: string }) {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                parentId: props.village._id,
            };

            const res = await fetch("/api/villages", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = (await res.json()) as ApiResponse<{ village: VillageRow }>;

            if (!res.ok || !json.success) {
                message.error(!json.success ? json.error.message : "Create sub-village failed");
                return;
            }

            message.success("Sub-village created");
            setCreateModalOpen(false);
            form.resetFields();
            await refresh();
        } finally {
            setSubmitting(false);
        }
    }

    const columns: ColumnsType<VillageRow> = [
        { title: "Name", dataIndex: "name" },
        { title: "Taluka", dataIndex: "taluka" },
        { title: "District", dataIndex: "district" },
        { title: "Code", dataIndex: "code" },
        {
            title: "Status",
            dataIndex: "status",
            render: (status: string) => (
                <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
            )
        },
        {
            title: "Actions",
            render: (_, row) => (
                <Link href={`/superadmin/villages/${row._id}`}>
                    <Button size="small">View Dashboard</Button>
                </Link>
            ),
        },
    ];

    const pageTitle = props.parentVillage
        ? `${props.parentVillage.name} - ${props.village.name}`
        : props.village.name;

    return (
        <AppShell title={pageTitle} role={UserRole.SUPER_ADMIN}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Card
                    title={props.parentVillage ? "Sub-Village Details" : "Village Details"}
                    extra={
                        <Space>
                            {props.parentVillage && (
                                <Link href={`/superadmin/villages/${props.parentVillage._id}`}>
                                    Back to {props.parentVillage.name}
                                </Link>
                            )}
                            <Link href="/superadmin/villages">Village List</Link>
                        </Space>
                    }
                >
                    {props.parentVillage && (
                        <div style={{ marginBottom: 16, padding: '8px 16px', background: '#f5f5f5', borderRadius: 4 }}>
                            Dashboard: <b>महाराष्ट्र - {props.parentVillage.district} - {props.parentVillage.name} - {props.village.name}</b>
                        </div>
                    )}
                    <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                        <Descriptions.Item label="Name">{props.village.name}</Descriptions.Item>
                        <Descriptions.Item label="Taluka">{props.village.taluka}</Descriptions.Item>
                        <Descriptions.Item label="District">{props.village.district}</Descriptions.Item>
                        <Descriptions.Item label="Code">{props.village.code}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={props.village.status === "ACTIVE" ? "green" : "red"}>
                                {props.village.status}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card
                    title="Citizens / Properties (नागरिक / मालमत्ता)"
                    extra={
                        <Link href={`/superadmin/villages/${props.village._id}/properties/create`}>
                            <Button type="primary">Add Property</Button>
                        </Link>
                    }
                >
                    {props.properties.length > 0 ? (
                        <Table
                            rowKey={(r) => r._id}
                            dataSource={props.properties}
                            pagination={{ pageSize: 5 }}
                            columns={[
                                { title: "Property No", dataIndex: "propertyNo" },
                                {
                                    title: "Owner Name",
                                    dataIndex: "ownerName",
                                    render: (name, row) => (
                                        <Link href={`/superadmin/villages/${props.village._id}/properties/${row._id}`} style={{ fontWeight: 500 }}>
                                            {name}
                                        </Link>
                                    )
                                },
                                { title: "Mobile", dataIndex: "mobile" },
                                {
                                    title: "Actions",
                                    render: () => (
                                        <Button size="small">Edit</Button> // TODO: Add edit link
                                    )
                                }
                            ]}
                        />
                    ) : (
                        <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>
                            No properties added yet. Click &quot;Add Property&quot; to start.
                        </p>
                    )}
                </Card>

                <Card
                    title="Sub-Villages (समाविष्ट गावे)"
                    extra={
                        <Button type="primary" onClick={() => setCreateModalOpen(true)}>
                            Add Sub-Village
                        </Button>
                    }
                >
                    <Table
                        rowKey={(r) => r._id}
                        columns={columns}
                        dataSource={props.subVillages}
                        pagination={false}
                    />
                </Card>
            </Space>

            <Modal
                title="Add Sub-Village"
                open={createModalOpen}
                onCancel={() => setCreateModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onCreateSubVillage}
                    initialValues={{
                        taluka: props.village.taluka,
                        district: props.village.district,
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Sub-Village Name"
                        rules={[{ required: true }]}
                        valuePropName="value"
                        trigger="onChange"
                        getValueFromEvent={(v) => v}
                    >
                        <MarathiTransliterateInput placeholder="Type sub-village name" />
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
        </AppShell>
    );
}
