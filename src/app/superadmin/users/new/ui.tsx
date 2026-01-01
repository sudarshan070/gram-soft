"use client";

import { Button, Card, Form, Input, Select, message } from "antd";
import { useRouter } from "next/navigation";

import { AppShell } from "@/ui/layouts/AppShell";
import { MarathiTransliterateInput } from "@/ui/components/MarathiTransliterateInput";

type ApiErrorShape = { code: string; message: string; details?: unknown };
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorShape };

type CreateUserResponse = {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
};

export function SuperAdminCreateUserClient() {
  const router = useRouter();

  async function onFinish(values: {
    name: string;
    email: string;
    password: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "USER";
    status?: "ACTIVE" | "INACTIVE";
  }) {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = (await res.json()) as ApiResponse<CreateUserResponse>;

    if (!res.ok || !json.success) {
      message.error(!json.success ? json.error.message : "Create user failed");
      return;
    }

    message.success("User created");
    router.replace("/superadmin/users");
  }

  return (
    <AppShell
      title="Create User"
      menuItems={[
        { key: "dash", label: "Dashboard", href: "/superadmin/dashboard" },
        { key: "users", label: "Users", href: "/superadmin/users" },
        { key: "new-user", label: "Create User", href: "/superadmin/users/new" },
        { key: "villages", label: "Villages", href: "/superadmin/villages" },
      ]}
    >
      <Card title="Create User" style={{ maxWidth: 520 }}>
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ role: "USER", status: "ACTIVE" }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
            valuePropName="value"
            trigger="onChange"
            getValueFromEvent={(v) => v}
          >
            <MarathiTransliterateInput
              placeholder="Type name (Marathi typing placeholder)"
            />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "USER", label: "USER" },
                { value: "ADMIN", label: "ADMIN" },
                { value: "SUPER_ADMIN", label: "SUPER_ADMIN" },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "INACTIVE", label: "INACTIVE" },
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Create
          </Button>
        </Form>
      </Card>
    </AppShell>
  );
}
