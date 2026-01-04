
"use client";

import { App, Button, Card, Checkbox, Col, Form, Input, Row, Select, Space, Table, Typography, InputNumber } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

import { AppShell } from "@/ui/layouts/AppShell";
import { MarathiTransliterateInput } from "@/ui/components/MarathiTransliterateInput";
import { UserRole } from "@/server/models/types";

const { Title, Text } = Typography;
const { Option } = Select;

// Props types
type Props = {
    village: { _id: string; name: string };
    constructionRates: { _id: string; propertyTypeMr: string; constructionRate: number; landRate: number }[];
    usageFactors: { _id: string; usageTypeMr: string; weightage: number }[];
    waterTaxRates: { _id: string; waterTaxTypeMr: string; rate: number }[];
};

export function CreatePropertyClient({ village, constructionRates, usageFactors, waterTaxRates }: Props) {
    const router = useRouter();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Helper to calculate area
    const onValuesChange = (changedValues: any, allValues: any) => {
        // If length or width changes in constructions, update area
        if (changedValues.constructions) {
            const constructions = form.getFieldValue("constructions") || [];
            const updatedConstructions = constructions.map((c: any) => {
                if (c?.length && c?.width) {
                    return { ...c, areaSqFt: (parseFloat(c.length) * parseFloat(c.width)).toFixed(2) };
                }
                return c;
            });
            // Updating form value inside onValuesChange can cause loops if not careful,
            // but typical pattern is to setFieldsValue. 
            // Antd Form.List handles indexed updates, but calculation usually needs manual intervention or a dependency.
            // Simplest is to let user see calculation or handle it at submit.
            // But user expects auto-calc.
        }
    };

    // Custom component for Construction List to handle dynamic rows nicely
    // Moving inline for simplicity to match image layout

    async function onFinish(values: any) {
        setSubmitting(true);
        try {
            // Calculate areas if not present (though UI should show them)
            const formattedConstructions = values.constructions?.map((c: any) => ({
                ...c,
                areaSqFt: Number(c.length) * Number(c.width),
            })) || [];

            const payload = {
                ...values,
                constructions: formattedConstructions,
                villageId: village._id,
            };

            const res = await fetch(`/api/villages/${village._id}/properties`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error?.message || "Failed to create property");
            }

            message.success("Property added successfully!");
            router.push(`/superadmin/villages/${village._id}`);
            router.refresh();
        } catch (err: any) {
            message.error(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AppShell title={`Add Property - ${village.name}`} role={UserRole.SUPER_ADMIN}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    constructions: [{}], // Start with one row
                }}
            // onValuesChange={onValuesChange}
            >
                <Card title="House / Property Assessment Form" style={{ marginBottom: 24 }}>
                    {/* Section 1: Personal Details */}
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="isTaxExempt" valuePropName="checked">
                                <Checkbox>No Tax Allowed (Exempt)</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="propertyNo" label="Property No. (मालमत्ता क्र.)" rules={[{ required: true }]}>
                                <Input placeholder="e.g. 1/1" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="wardNo" label="Ward No. (वार्ड नं)" rules={[{ required: true }]}>
                                <Input placeholder="1" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="waterTaxType" label="Water Tax (पाणी कर)">
                                <Select placeholder="Select Type">
                                    {waterTaxRates.map(r => (
                                        <Option key={r._id} value={r.waterTaxTypeMr}>{r.waterTaxTypeMr} (₹ {r.rate})</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="ownerName" label="Owner Name (घरमालकाचे नाव)" rules={[{ required: true }]}>
                                <MarathiTransliterateInput placeholder="Full Name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="occupierName" label="Occupier Name (भोगवटादाराचे नाव)">
                                <MarathiTransliterateInput placeholder="Occupier Name (or 'Self')" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="spouseName" label="Spouse/Relative Name (पती/पत्नीचे नाव)">
                                <MarathiTransliterateInput />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="address" label="Address (पत्ता)">
                                <MarathiTransliterateInput />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={6}>
                            <Form.Item name="mobile" label="Mobile No 1" rules={[{ required: true }]}>
                                <Input type="tel" maxLength={10} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="mobile2" label="Mobile No 2">
                                <Input type="tel" maxLength={10} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Directions / Neighbors */}
                    <Text strong style={{ display: 'block', marginTop: 16, marginBottom: 8 }}>Directions / Neighbors (चतुःसीमा)</Text>
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name={['directions', 'east']} label="East (पूर्व)">
                                <MarathiTransliterateInput />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name={['directions', 'west']} label="West (पश्चिम)">
                                <MarathiTransliterateInput />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name={['directions', 'north']} label="North (उत्तर)">
                                <MarathiTransliterateInput />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name={['directions', 'south']} label="South (दक्षिण)">
                                <MarathiTransliterateInput />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Section 2: Construction / Property Details Table */}
                <Card title="Property Description (मालमत्तेचे वर्णन)" style={{ marginBottom: 24 }}>
                    <Form.List name="constructions">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} style={{ background: '#f9f9f9', padding: 16, marginBottom: 16, borderRadius: 8, border: '1px solid #eee' }}>
                                        <Row gutter={16}>
                                            <Col xs={24} md={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'constructionType']}
                                                    label="Description (मालमत्तेचे वर्णन)"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Select placeholder="Type">
                                                        {constructionRates.map(r => (
                                                            <Option key={r._id} value={r.propertyTypeMr}>{r.propertyTypeMr}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'constructionYear']}
                                                    label="Year (वर्ष)"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'floor']}
                                                    label="Floor (मजला)"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Select>
                                                        <Option value="Ground">Ground</Option>
                                                        <Option value="First">First</Option>
                                                        <Option value="Second">Second</Option>
                                                        <Option value="Third">Third</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'usageType']}
                                                    label="Usage (वापर)"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Select placeholder="Select Usage">
                                                        {usageFactors.map(u => (
                                                            <Option key={u._id} value={u.usageTypeMr}>{u.usageTypeMr} (Wt: {u.weightage})</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col xs={12} md={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'length']}
                                                    label="Length (Ft)"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'width']}
                                                    label="Width (Ft)"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
                                                </Form.Item>
                                            </Col>
                                            {/* Calculated Area Display logic could go here, but for now simple input/display */}
                                            <Col xs={24} md={6} style={{ display: 'flex', alignItems: 'center' }}>
                                                <Button type="dashed" onClick={() => remove(name)} danger icon={<MinusCircleOutlined />}>
                                                    Remove Row
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Property Description Row
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Card>

                <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
                        SUBMIT PROPERTY RECORD
                    </Button>
                </Form.Item>

            </Form>
        </AppShell>
    );
}
