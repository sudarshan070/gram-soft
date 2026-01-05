"use client";

import { Card, Descriptions, Table, Typography, Space, Button } from "antd";
import Link from "next/link";
import { AppShell } from "@/ui/layouts/AppShell";
import { UserRole } from "@/server/models/types";

const { Text } = Typography;

export function PropertyTaxDetailClient(props: {
    village: { _id: string; name: string; district: string };
    property: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    rates: {
        construction: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
        depreciation: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
        usage: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
        water: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    };
}) {
    const { property, rates, village } = props;

    // --- Calculation Logic ---
    // This replicates the logic from the image/requirement implicitly
    // Rateable Value (भांडवली मूल्य) = Area * Construction Rate * Usage Weightage
    // Depreciation is based on Building Age
    // This is a simplified view to show data first.

    // Helper to find rates
    const getConstructionRate = (type: string) => rates.construction.find((r: any) => r.propertyTypeMr === type); // eslint-disable-line @typescript-eslint/no-explicit-any
    const getUsageFactor = (type: string) => rates.usage.find((r: any) => r.usageTypeMr === type); // eslint-disable-line @typescript-eslint/no-explicit-any
    const getDepreciation = (age: number) => {
        // Find matching range
        return rates.depreciation.find((r: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (r.ageToYear === null) return age >= r.ageFromYear;
            return age >= r.ageFromYear && age <= r.ageToYear;
        });
    };

    // Calculate for each construction
    const taxDetails = property.constructions.map((c: any, index: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const rateObj = getConstructionRate(c.constructionType);
        const usageObj = getUsageFactor(c.usageType);

        const constructionRate = rateObj ? rateObj.constructionRate : 0;
        const landRate = rateObj ? rateObj.landRate : 0;
        // Assuming 'approvedRate' in GlobalConstructionLandRate is the 'Karava' (Tax Rate)
        // If not, we might need a separate TaxRate configuration. 
        // For now, using approvedRate as a proxy or defaulting to a value.
        // In the image, rates are 0.75, 0.60, 1.50. These look like specific levies.
        // Let's use approvedRate if reasonable, otherwise default to 0.60 for demo or fetch correctly.
        const taxRate = rateObj ? rateObj.approvedRate : 0;

        const weightage = usageObj ? usageObj.weightage : 1;

        const currentYear = new Date().getFullYear();
        // If year is 0 (as seen in image for Open Land), treat as special case? 
        // Image shows Year 0 -> Age 0 -> Depreciation 0?
        // Actually Image: Year 0, Depreciation (Ghasara) 0 (Wait, remaining val 100? No, image has Dep "0" but Value calculated solely on LandRate?)
        // Let's re-read Row 3: Land 1200, Const 1200 (Wait, ConstRate 1200? maybe typo in my thought, image says 1200). 
        // Dep is 0. SqM 21.38. (1200 + 1200*0) * 21.38 = 25656. Matches.
        // So if Dep is 0, it means NO building value added? Or Dep % is 0 so Construction part becomes 0?
        // Formula: Land + (Const * Dep/100). If Dep is 0 => Land + 0. Correct.

        const age = c.constructionYear === 0 ? 0 : currentYear - c.constructionYear;
        const depObj = getDepreciation(age);
        // If no depObj found (e.g. year 0), default to 100 or 0? 
        // For Year 0 (Open Space), we want Dep Factor to be 0 so only Land Rate applies.
        // Standard logic: If construction exists, Dep is remaining value %. 
        const depPercentage = c.constructionYear === 0 ? 0 : (depObj ? depObj.depreciationRate : 100);

        // Areas
        const areaSqFt = c.areaSqFt;
        const areaSqMeter = areaSqFt / 10.76;

        // Capital Value (Bhandavli Mulya)
        // Formula: (LandRate + (ConstructionRate * DepPercentage/100)) * AreaSqMeter * Weightage
        const effectiveRate = landRate + (constructionRate * (depPercentage / 100));
        const capitalValue = effectiveRate * areaSqMeter * weightage;

        // Tax (Kar)
        // Formula: (CapitalValue * TaxRate) / 1000
        // Image implies / 1000 mill rate. 
        const taxAmount = (capitalValue * taxRate) / 1000;

        return {
            key: index,
            ...c,
            age,
            areaSqMeter: areaSqMeter.toFixed(2),
            landRate,
            constructionRate,
            taxRate,
            weightage,
            depPercentage,
            capitalValue: capitalValue.toFixed(2),
            taxAmount: Math.round(taxAmount), // Rounded to nearest integer as per image
        };
    });

    const columns = [
        { title: "Property Description (मालमत्तेचे वर्णन)", dataIndex: "constructionType" },
        { title: "Floor (मजला)", dataIndex: "floor", render: (v: any) => v || "-" }, // eslint-disable-line @typescript-eslint/no-explicit-any
        { title: "Year (बां.वर्ष)", dataIndex: "constructionYear" },
        { title: "Weightage (भारांक)", dataIndex: "weightage" },
        { title: "Length (लांबी फूट)", dataIndex: "length" },
        { title: "Width (रुंदी फूट)", dataIndex: "width" },
        { title: "Sq Ft (चौ.फूट)", dataIndex: "areaSqFt" },
        { title: "Sq M (चौ.मीटर)", dataIndex: "areaSqMeter" },
        { title: "Land Rate (रे.रे.जमीन दर)", dataIndex: "landRate" },
        { title: "Const Rate (रे.रे.बांधकाम दर)", dataIndex: "constructionRate" },
        { title: "Dep % (घसारा दर)", dataIndex: "depPercentage" },
        { title: "Capital Value (भांडवली मूल्य)", dataIndex: "capitalValue", render: (val: string) => <Text strong>₹ {val}</Text> },
        { title: "Rate (करावा)", dataIndex: "taxRate" },
        { title: "Tax (घर कर)", dataIndex: "taxAmount", render: (val: number) => <Text strong type="danger">₹ {val}</Text> },
        {
            title: "Action",
            render: () => <Button size="small" danger>Remove</Button>
        }
    ];

    const waterTaxObj = rates.water.find((r: any) => r.waterTaxTypeMr === property.waterTaxType); // eslint-disable-line @typescript-eslint/no-explicit-any
    const waterTax = waterTaxObj ? waterTaxObj.rate : 0;

    return (
        <AppShell title={`Property Tax: ${property.ownerName} `} role={UserRole.SUPER_ADMIN}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Card extra={<Link href={`/superadmin/villages/${village._id}`}>Back to Dashboard</Link>}>
                    <Descriptions title="Owner Details" bordered column={{ xs: 1, sm: 2, md: 3 }}>
                        <Descriptions.Item label="Owner Name">{property.ownerName}</Descriptions.Item>
                        <Descriptions.Item label="Property No">{property.propertyNo}</Descriptions.Item>
                        <Descriptions.Item label="Ward No">{property.wardNo}</Descriptions.Item>
                        <Descriptions.Item label="Mobile">{property.mobile}</Descriptions.Item>
                        <Descriptions.Item label="Aadhar No">{property.aadharNumber || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Water Tax Type">{property.waterTaxType || "-"} (₹ {waterTax})</Descriptions.Item>
                        <Descriptions.Item label="Address" span={3}>{property.address || "-"}</Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="Assessment Details (आकारणी तपशील)">
                    <Table
                        dataSource={taxDetails}
                        columns={columns}
                        scroll={{ x: 1300 }}
                        pagination={false}
                        summary={(pageData) => {
                            let totalTax = 0;
                            // eslint-disable-line @typescript-eslint/no-explicit-any
                            pageData.forEach((row: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                totalTax += Number(row.taxAmount);
                            });

                            return (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={13}><Text strong style={{ textAlign: 'right', display: 'block' }}>Total Tax</Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1}>
                                        <Text strong type="danger">₹ {Math.round(totalTax)}</Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
