"use client";

import { Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { UserRole } from "@/server/models";
import { getNavItems } from "@/ui/navigation";

const { Sider, Content, Header } = Layout;

export function UserDashboard(props: {
  title: string;
  role: UserRole;
  villageId?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const menuItems = getNavItems({ role: props.role, villageId: props.villageId });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={0}
        width={240}
        style={{ 
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          overflow: "hidden"
        }}
      >
        <div style={{
          height: 48,
          margin: 16,
          color: "white",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
        }}>
          Swaraj Gram Soft
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems.map((i) => ({
            key: i.href,
            label: <Link href={i.href}>{i.label}</Link>,
          }))}
        />
        <div style={{ 
          position: "absolute", 
          bottom: 16, 
          left: 16, 
          right: 16 
        }}>
          <button 
            onClick={async () => {
              try {
                const res = await fetch("/api/auth/logout", { method: "POST" });
                if (res.ok) {
                  window.location.href = "/login";
                }
              } catch (error) {
                console.error("Logout failed:", error);
              }
            }}
            style={{
              width: "100%",
              padding: "8px 16px",
              backgroundColor: "#ff4d4f",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            Logout
          </button>
        </div>
      </Sider>
      <Layout style={{ minHeight: "100vh", marginLeft: collapsed ? 0 : 240 }}>
        <Header style={{ background: "white", display: "flex", alignItems: "center" }}>
          <div style={{ fontWeight: 600 }}>{props.title}</div>
        </Header>
        <Content style={{ 
          padding: "clamp(12px, 2.5vw, 24px)",
          marginLeft: collapsed ? 0 : 240
        }}>{props.children}</Content>
      </Layout>
    </Layout>
  );
}
