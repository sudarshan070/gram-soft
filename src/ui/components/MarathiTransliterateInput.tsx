"use client";

import { Input } from "antd";

export function MarathiTransliterateInput(props: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Input
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value)}
      placeholder={props.placeholder}
      disabled={props.disabled}
    />
  );
}
