"use client";

import { Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
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
        <Content style={{ padding: 24 }}>{props.children}</Content>
      </Layout>
    </Layout>
  );
}
