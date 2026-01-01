"use client";

import { App } from "antd";

export function AntdAppProvider(props: { children: React.ReactNode }) {
  return <App>{props.children}</App>;
}
