import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { AISplitResponse } from "@/lib/ai-split-mock";

const MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
] as const;

function buildPrompt(rootTitle: string, rootDescription?: string, deadlineAt?: string): string {
  const parts = [
    `请将以下任务拆解为可执行的子任务清单，支持多层级（用 level 表示：0=第一层，1=第二层，2=第三层…）。`,
    ``,
    `任务标题：${rootTitle}`,
  ];
  if (rootDescription?.trim()) parts.push(`任务描述：${rootDescription.trim()}`);
  if (deadlineAt) parts.push(`截止时间：${deadlineAt}`);
  parts.push(
    ``,
    `请严格按照以下 JSON 格式输出，不要输出任何其他文字或 markdown 标记。`,
    `格式示例：`,
    `{"items":[{"title":"准备资料","level":0},{"title":"收集 W-2","level":1},{"title":"填写与核对","level":0},{"title":"录入收入并自查","level":1}],"disclaimer":"以上为建议拆解，请按需修改。"}`,
    ``,
    `要求：items 为数组，每项必有 title 和 level（非负整数，且不能比前一项大超过 1）；note 可选；disclaimer 为一句简短说明。只输出一个合法 JSON。`
  );
  return parts.join("\n");
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  return trimmed;
}

function parseResponse(text: string): AISplitResponse | null {
  try {
    const raw = extractJson(text);
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    const arr = obj.items;
    if (!Array.isArray(arr)) return null;
    const items: AISplitResponse["items"] = [];
    let prevLevel = -1;
    for (const it of arr as unknown[]) {
      if (!it || typeof it !== "object") continue;
      const item = it as Record<string, unknown>;
      const title = typeof item.title === "string" ? item.title : "";
      const rawLevel = item.level;
      let level = 0;
      if (typeof rawLevel === "number" && Number.isInteger(rawLevel) && rawLevel >= 0) {
        level = Math.min(rawLevel, prevLevel + 1);
      }
      prevLevel = level;
      items.push({
        title,
        note: typeof item.note === "string" ? item.note : "",
        level,
      });
    }
    const disclaimer = typeof obj.disclaimer === "string" ? obj.disclaimer : "以上为 AI 建议拆解，请按需修改。";
    return { items, disclaimer };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY 未配置" },
      { status: 503 }
    );
  }

  let body: { rootTitle?: string; rootDescription?: string; deadlineAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "请求体必须是 JSON" },
      { status: 400 }
    );
  }

  const rootTitle = typeof body.rootTitle === "string" ? body.rootTitle.trim() : "";
  if (!rootTitle) {
    return NextResponse.json(
      { error: "缺少 rootTitle" },
      { status: 400 }
    );
  }

  const rootDescription = typeof body.rootDescription === "string" ? body.rootDescription : undefined;
  const deadlineAt = typeof body.deadlineAt === "string" ? body.deadlineAt : undefined;

  const params = { rootTitle, rootDescription, deadlineAt };
  console.log("[api/ai-split] params:", JSON.stringify(params));

  const prompt = buildPrompt(rootTitle, rootDescription, deadlineAt);
  const ai = new GoogleGenAI({ apiKey });
  let lastError: Error | null = null;

  for (const model of MODELS) {
    console.log("[api/ai-split] trying model:", model);
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const text = response.text;
      console.log("[api/ai-split]", model, "response.text:", text);
      if (!text) {
        lastError = new Error(`${model} 未返回内容`);
        continue;
      }

      const parsed = parseResponse(text);
      if (!parsed) {
        lastError = new Error(`${model} 返回无法解析的 JSON`);
        continue;
      }

      console.log("[api/ai-split] used model:", model, "params:", JSON.stringify(params), "parsed:", JSON.stringify(parsed));
      return NextResponse.json(parsed);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn("[api/ai-split]", model, "failed:", lastError.message);
    }
  }

  console.error("[api/ai-split] all models failed, last:", lastError);
  return NextResponse.json(
    { error: lastError?.message ?? "所有模型均调用失败" },
    { status: 500 }
  );
}
