"use client";

import { Card } from "antd";

import { UserDashboard } from "@/ui/layouts/UserDashboard";

export function UserDashboardClient({ name }: { name: string }) {
  return (
    <UserDashboard title="Dashboard" role="USER">
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
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          <h1 style={{ 
            fontSize: "28px", 
            marginBottom: "16px",
            color: "#1890ff",
            fontWeight: "600"
          }}>
            Welcome to Gram-Soft
          </h1>
          <p style={{ 
            fontSize: "18px", 
            marginBottom: "8px",
            color: "#262626"
          }}>
            Hello <strong>{name}</strong>!
          </p>
          <p style={{ 
            fontSize: "16px", 
            color: "#8c8c8c",
            lineHeight: "1.5"
          }}>
            We are working on creating your personalized dashboard. 
            <br />
            You'll be able to manage village data and access powerful tools here soon.
          </p>
          <div style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: "8px"
          }}>
            <p style={{ 
              margin: 0,
              color: "#52c41a",
              fontSize: "14px"
            }}>
              🚀 Your dashboard is under construction. Check back soon for updates!
            </p>
          </div>
        </Card>
      </div>
    </UserDashboard>
  );
}
