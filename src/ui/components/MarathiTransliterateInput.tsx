"use client";

import { AutoComplete, Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import Sanscript from "sanscript";

export function MarathiTransliterateInput(props: {
  value?: string;                 // this will be MARATHI
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const externalValue = props.value ?? "";
  const [display, setDisplay] = useState(externalValue);

  function withAnusvaraHeuristic(input: string) {
    // Map a subset of common English "n" + consonant clusters to anusvara.
    // Example: Priyanka -> PriyaMka -> प्रियंका
    return input.replace(/n(?=(kh|k|gh|g|ch|c|jh|j|th|t|dh|d|ph|p|bh|b))/gi, "M");
  }

  useEffect(() => {
    // If parent updates the value (e.g. form reset), reflect it.
    setDisplay(externalValue);
  }, [externalValue]);

  const isLatin = useMemo(() => /[a-zA-Z]/.test(display), [display]);

  const options = useMemo(() => {
    const q = display.trim();
    if (!q) return [] as Array<{ value: string; label: string }>;
    if (!/[a-zA-Z]/.test(q)) return [] as Array<{ value: string; label: string }>;

    // Sanscript works best with ITRANS-ish input; for simple English names it's good enough.
    const base = Sanscript.t(q, "itrans", "devanagari");
    const lower = Sanscript.t(q.toLowerCase(), "itrans", "devanagari");
    const anusvara = Sanscript.t(withAnusvaraHeuristic(q), "itrans", "devanagari");
    const titleCase = q
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const title = Sanscript.t(titleCase, "itrans", "devanagari");

    const uniq = Array.from(new Set([base, lower, anusvara, title].filter(Boolean)));
    return uniq.map((v) => ({ value: v, label: v }));
  }, [display]);

  function commitMarathiIfNeeded() {
    const q = display.trim();
    if (!q) return;
    if (!/[a-zA-Z]/.test(q)) {
      props.onChange?.(q);
      return;
    }
    const mar = Sanscript.t(withAnusvaraHeuristic(q), "itrans", "devanagari");
    setDisplay(mar);
    props.onChange?.(mar);
  }

  return (
    <AutoComplete
      value={display}
      options={isLatin ? options : []}
      onSelect={(v) => {
        setDisplay(v);
        props.onChange?.(v);
      }}
      onSearch={(text) => {
        setDisplay(text);
        // keep parent in sync so Form validations work
        props.onChange?.(text);
      }}
      filterOption={false}
      disabled={props.disabled}
    >
      <Input
        placeholder={props.placeholder}
        disabled={props.disabled}
        onBlur={() => commitMarathiIfNeeded()}
        onPressEnter={() => commitMarathiIfNeeded()}
      />
    </AutoComplete>
  );
}
