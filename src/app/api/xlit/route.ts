import { jsonError, jsonOk, badRequest } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get("lang") ?? "mr").trim();
    const text = (searchParams.get("text") ?? "").trim();
    const num = Number(searchParams.get("num") ?? "6");

    if (!text) throw badRequest("Missing text");
    if (text.length > 70) throw badRequest("Text too long");

    const safeNum = Number.isFinite(num) ? Math.min(Math.max(num, 1), 10) : 6;

    const url = `https://xlit-api.ai4bharat.org/tl/${encodeURIComponent(lang)}/${encodeURIComponent(text)}?num_suggestions=${safeNum}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { method: "GET", signal: controller.signal });
    const bodyText = await res.text();
    clearTimeout(timeout);

    let parsed: { success?: boolean; result?: unknown; error?: string } | null = null;
    try {
      parsed = JSON.parse(bodyText) as { success?: boolean; result?: unknown; error?: string };
    } catch {
      parsed = null;
    }

    const result = Array.isArray(parsed?.result) ? (parsed?.result as string[]) : [];

    return jsonOk({
      result,
      upstreamStatus: res.status,
      upstreamSuccess: Boolean(parsed?.success),
      upstreamError: parsed?.error ?? (!res.ok ? bodyText.slice(0, 300) : undefined),
    });
  } catch (err) {
    return jsonError(err);
  }
}
