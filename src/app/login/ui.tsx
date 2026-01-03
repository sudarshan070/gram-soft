"use client";

import { App, Button, Card, Form, Input, Typography } from "antd";
import { useRouter } from "next/navigation";

import { UserRole } from "@/server/models/types";

type ApiErrorShape = { code: string; message: string; details?: unknown };
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorShape };

type LoginResponse = { user: { id: string; name: string; email: string; role: string } };
type MeResponse = { user: { id: string; role: string; name: string; email: string; villageIds: string[] } };

export function LoginForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();

  async function onFinish(values: { email: string; password: string }) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = (await res.json()) as ApiResponse<LoginResponse>;

    if (!res.ok || !json?.success) {
      message.error(!json.success ? json.error.message : "Login failed");
      return;
    }

    const role = json.data.user.role;

    if (role === UserRole.SUPER_ADMIN) {
      router.replace("/superadmin/dashboard");
      return;
    }

    // All other users go to user dashboard
    router.replace("/user/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Login
        </Typography.Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ email: "admin", password: "admin123" }}
        >
          <Form.Item name="email" label="Email / Username" rules={[{ required: true }]}>
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
