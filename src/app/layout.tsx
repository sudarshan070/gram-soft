import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";

import { antdTheme } from "@/ui/theme";
import { AntdReact19Patch } from "./AntdReact19Patch";
import { AntdAppProvider } from "./AntdAppProvider";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swaraj Gram Soft",
  description: "Gram Panchayat tax tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthErrorBoundary>
          <AntdRegistry>
            <AntdReact19Patch />
            <ConfigProvider theme={antdTheme}>
              <AntdAppProvider>{children}</AntdAppProvider>
            </ConfigProvider>
          </AntdRegistry>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
