"use client";

import { Button, Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import type { UserRole } from "@/server/models";
import { getNavItems } from "@/ui/navigation";

const { Sider, Content, Header } = Layout;

export function AppShell(props: {
  title: string;
  role: UserRole;
  villageId?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = getNavItems({ role: props.role, villageId: props.villageId });
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

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
          <Button 
            type="primary" 
            danger 
            block 
            onClick={handleLogout}
          >
            Logout
          </Button>
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
