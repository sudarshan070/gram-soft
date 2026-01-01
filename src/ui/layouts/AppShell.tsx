"use client";

import { Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
      </Sider>
      <Layout>
        <Header style={{ background: "white", display: "flex", alignItems: "center" }}>
          <div style={{ fontWeight: 600 }}>{props.title}</div>
        </Header>
        <Content style={{ padding: "clamp(12px, 2.5vw, 24px)" }}>{props.children}</Content>
      </Layout>
    </Layout>
  );
}
