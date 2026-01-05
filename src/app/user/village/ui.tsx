"use client";

import { Card, Button, Typography, Space, Alert, Divider, Row, Col, Statistic, List, Avatar, Tag, Table } from "antd";
import { MailOutlined, PhoneOutlined, UserOutlined, TeamOutlined, EnvironmentOutlined, HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";

import { UserRole } from "@/server/models/types";
import { UserDashboard } from "@/ui/layouts/UserDashboard";

const { Title, Paragraph, Text } = Typography;

export function UserVillageClient({ 
  name, 
  email, 
  hasVillage, 
  village, 
  villageId,
  properties = [],
  subVillages = []
}: { 
  name: string; 
  email: string; 
  hasVillage: boolean; 
  village?: any; 
  villageId?: string;
  properties?: any[];
  subVillages?: any[];
}) {
  
  console.log("==============",village)
  // Handle case when village is null or undefined
  if (!village) {
    return (
      <UserDashboard title="My Village" role={UserRole.USER}>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "60vh",
          padding: "24px"
        }}>
          <Card 
            style={{ 
              textAlign: "center", 
              maxWidth: "600px",
              width: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
              border: "1px solid #f0f0f0"
            }}
          >
            <Title level={3} style={{ color: "#ff4d4f" }}>Village Not Found</Title>
            <Text>Village details could not be loaded. Please try again later.</Text>
          </Card>
        </div>
      </UserDashboard>
    );
  }

  const userName = name;

  // Sub-village table columns (simplified from superadmin)
  const subVillageColumns: ColumnsType<any> = [
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
    }
  ];

  return (
    <UserDashboard title="My Village" role={UserRole.USER}>
      <div style={{ padding: "24px" }}>
        {/* Properties Table - Main content for this page now */}
        <Card
            title="Citizens / Properties (नागरिक / मालमत्ता)"
            extra={
                <Button type="primary" disabled>Add Property</Button> // Disabled for normal user view for now
            }
            style={{ marginBottom: 24 }}
        >
            {properties.length > 0 ? (
                <Table
                    rowKey={(r) => r._id}
                    dataSource={properties}
                    pagination={{ pageSize: 5 }}
                    columns={[
                        { title: "Property No", dataIndex: "propertyNo" },
                        {
                            title: "Owner Name",
                            dataIndex: "ownerName",
                            render: (name, row) => (
                                <Text strong>{name}</Text>
                            )
                        },
                        { title: "Mobile", dataIndex: "mobile" },
                        {
                            title: "Actions",
                            render: () => (
                                <Button size="small">View</Button>
                            )
                        }
                    ]}
                />
            ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>
                    No properties found for this village.
                </p>
            )}
        </Card>

        {/* Sub-Villages Table */}
        <Card
            title="Sub-Villages (समाविष्ट गावे)"
        >
            {subVillages.length > 0 ? (
                <Table
                    rowKey={(r) => r._id}
                    columns={subVillageColumns}
                    dataSource={subVillages}
                    pagination={false}
                />
            ) : (
                <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>
                    No sub-villages found.
                </p>
            )}
        </Card>
      </div>
    </UserDashboard>
  );
}
