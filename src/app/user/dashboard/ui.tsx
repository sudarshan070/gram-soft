"use client";

import { Card, Button, Typography, Space, Alert, Divider, Row, Col, Statistic, List, Avatar, Tag, Table } from "antd";
import { MailOutlined, PhoneOutlined, UserOutlined, TeamOutlined, EnvironmentOutlined, HomeOutlined } from "@ant-design/icons";
import Link from "next/link";

import { UserRole } from "@/server/models/types";
import { UserDashboard } from "@/ui/layouts/UserDashboard";

const { Title, Paragraph, Text } = Typography;

export function UserDashboardClient({ 
  name, 
  email, 
  hasVillage, 
  village, 
  villageId,
  properties = []
}: { 
  name: string; 
  email: string; 
  hasVillage: boolean; 
  village?: any; 
  villageId?: string;
  properties?: any[];
}) {
  // If user has no village assigned, show the pending message
  if (!hasVillage) {
    return (
      <UserDashboard title="Dashboard" role={UserRole.USER}>
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
              maxWidth: "700px",
              width: "100%",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              border: "1px solid #f0f0f0"
            }}
            styles={{ body: { padding: "40px" } }}
          >
            {/* Header Section */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: "32px",
                color: "white"
              }}>
                🏘️
              </div>
              <Title level={2} style={{ 
                color: "#262626", 
                marginBottom: "8px",
                fontWeight: "600"
              }}>
                Village Assignment Pending
              </Title>
              <Text style={{ 
                fontSize: "16px", 
                color: "#8c8c8c",
                display: "block"
              }}>
                Hello <strong>{name}</strong>, your village access is not yet configured
              </Text>
            </div>

            {/* Alert Section */}
            <Alert
              message="No Village Assigned"
              description="You haven't been assigned to any village yet. Please contact your administrator to get village access."
              type="warning"
              showIcon
              style={{ 
                marginBottom: "32px",
                textAlign: "left",
                borderRadius: "8px"
              }}
            />

            {/* Information Section */}
            <div style={{ 
              background: "#fafafa", 
              padding: "24px", 
              borderRadius: "12px", 
              marginBottom: "32px",
              textAlign: "left"
            }}>
              <Title level={4} style={{ color: "#1890ff", marginBottom: "16px" }}>
                📋 What You Need to Do
              </Title>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <span style={{ marginRight: "12px", color: "#52c41a", fontSize: "16px" }}>✓</span>
                  <Text>Contact your system administrator</Text>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <span style={{ marginRight: "12px", color: "#52c41a", fontSize: "16px" }}>✓</span>
                  <Text>Request village assignment for your area</Text>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <span style={{ marginRight: "12px", color: "#52c41a", fontSize: "16px" }}>✓</span>
                  <Text>Once assigned, you'll have full access to village management tools</Text>
                </div>
              </Space>
            </div>

            {/* Contact Information */}
            <div style={{ 
              background: "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)", 
              padding: "24px", 
              borderRadius: "12px", 
              marginBottom: "32px",
              textAlign: "left"
            }}>
              <Title level={4} style={{ color: "#1890ff", marginBottom: "16px" }}>
                📞 Contact Information
              </Title>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <UserOutlined style={{ marginRight: "12px", color: "#1890ff" }} />
                  <Text strong>Your Name: {name}</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MailOutlined style={{ marginRight: "12px", color: "#1890ff" }} />
                  <Text strong>Your Email: {email}</Text>
                </div>
              </Space>
            </div>
          </Card>
        </div>
      </UserDashboard>
    );
  }

  // If user has village assigned, show the village dashboard
  console.log("Showing village assigned screen with village:", village);
  
  // Hande case where hasVillage is true but village object failed to load
  if (!village) {
     return (
        <UserDashboard title="Dashboard" role={UserRole.USER}>
           <Alert message="Error loading village data" type="error" showIcon style={{ margin: 24 }} />
        </UserDashboard>
     )
  }

  return (
    <UserDashboard title="Dashboard" role={UserRole.USER}>
      <div style={{ padding: "24px" }}>
        {/* Village Header Card */}
        <Card 
          style={{ 
            marginBottom: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "16px"
          }}>
            <div>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                {village.name}
              </Title>
              <Text style={{ fontSize: "16px", color: "#8c8c8c" }}>
                Your Assigned Village
              </Text>
            </div>
            <Tag 
              color={village.status === "ACTIVE" ? "green" : "red"}
              style={{ fontSize: "14px", padding: "4px 12px" }}
            >
              {village.status}
            </Tag>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Statistic 
                title="Taluka" 
                value={village.taluka} 
                prefix={<EnvironmentOutlined style={{ color: "#1890ff" }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic 
                title="District" 
                value={village.district} 
                prefix={<HomeOutlined style={{ color: "#1890ff" }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic 
                title="Village Code" 
                value={village.code} 
                prefix={<Tag color="blue">{village.code}</Tag>}
              />
            </Col>
          </Row>

          {/* Help Text */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
             <Text style={{ color: "#8c8c8c", fontSize: "14px" }}>
               Welcome back, <strong>{name}</strong>! ({email})
             </Text>
          </div>
        </Card>
      </div>
    </UserDashboard>
  );
}
