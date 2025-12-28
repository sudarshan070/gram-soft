"use client";

import { Card, Typography } from "antd";

import { AppShell } from "@/ui/layouts/AppShell";

export function VillageDashboardClient(props: { village: { id: string; name: string } }) {
  return (
    <AppShell
      title={`Village Dashboard: ${props.village.name}`}
      menuItems={[
        {
          key: "dash",
          label: "Dashboard",
          href: `/village/${props.village.id}/dashboard`,
        },
      ]}
    >
      <Card>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          {props.village.name}
        </Typography.Title>
        <Typography.Paragraph>
          This is a placeholder dashboard. Stats endpoint is available at
          <Typography.Text code>{`/api/village/${props.village.id}/stats`}</Typography.Text>.
        </Typography.Paragraph>
      </Card>
    </AppShell>
  );
}
