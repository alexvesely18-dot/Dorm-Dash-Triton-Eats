import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isBase64SizeOk } from "@/lib/validate";

export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type AllowedMime = typeof ALLOWED_MIME_TYPES[number];

function detectMimeFromBase64(b64: string): AllowedMime | null {
  // Magic-byte sniffing on the first few decoded bytes
  // We only need the first 12 chars of base64 to see the header
  try {
    const head = Buffer.from(b64.slice(0, 24), "base64");
    if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return "image/png";
    if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
    if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return "image/gif";
    if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
        head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50) return "image/webp";
    return null;
  } catch {
    return null;
  }
}

function normalizeMime(claimed: unknown, sniffed: AllowedMime | null): AllowedMime {
  if (sniffed) return sniffed;
  if (ALLOWED_MIME_TYPES.includes(claimed as AllowedMime)) return claimed as AllowedMime;
  return "image/jpeg";
}

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "record_receipt",
  description: "Records the parsed fields from a UCSD Triton2Go dining-app receipt screenshot.",
  input_schema: {
    type: "object",
    properties: {
      pid_last4: {
        type: ["string", "null"],
        description:
          "EXACTLY the last 4 digits of the order/transaction number shown after the # symbol on the receipt. " +
          "If the receipt shows '#121358263', return '8263'. Always 4 digit characters. Null only if no number is visible.",
      },
      order_number: {
        type: ["string", "null"],
        description: "Full transaction number after the # symbol (e.g. '121358263'). Null if not visible.",
      },
      dining_hall: {
        type: ["string", "null"],
        description: "Name of the dining location (e.g. 'Bistro', '64 Degrees', 'Pines'). Null if not visible.",
      },
      items: {
        type: "array",
        items: { type: "string" },
        description: "Each food/drink item on the receipt as a string. Empty array if none readable.",
      },
      pickup_time: {
        type: ["string", "null"],
        description: "Pickup or order time exactly as shown (e.g. '1:02 PM'). Null if not shown.",
      },
      total: {
        type: ["string", "null"],
        description: "Order total dollar amount with $ (e.g. '$16.00'). Null if not visible.",
      },
    },
    required: ["pid_last4", "order_number", "dining_hall", "items", "pickup_time", "total"],
  },
};

type Extracted = {
  pid_last4: string | null;
  order_number: string | null;
  dining_hall: string | null;
  items: string[];
  pickup_time: string | null;
  total: string | null;
};

async function callModel(
  client: Anthropic,
  model: string,
  base64: string,
  mime: AllowedMime,
): Promise<Extracted> {
  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "record_receipt" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mime, data: base64 },
          },
          {
            type: "text",
            text:
              "This is a UCSD Triton2Go dining-app receipt. Read every visible field and call the " +
              "record_receipt tool. The order/transaction number appears after the '#' symbol near the top — " +
              "extract its final 4 digits as pid_last4. Read item names verbatim. Do not refuse; do not " +
              "ask questions; just call the tool with whatever you can see, using null for any field that " +
              "is genuinely not visible.",
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) {
    const textBlock = message.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    throw new Error(
      `Model did not call the tool (stop_reason=${message.stop_reason}): ${textBlock?.text?.slice(0, 200) ?? ""}`,
    );
  }
  return toolUse.input as Extracted;
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "analyze-screenshot", 10, 60_000)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Try again in 1 minute." },
      { status: 429 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { success: false, error: "ANTHROPIC_API_KEY not set on server" },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;

  if (!isBase64SizeOk(imageBase64, 10_000_000)) {
    return NextResponse.json(
      { success: false, error: "Image too large (max 10 MB)" },
      { status: 413 },
    );
  }

  const safeBase64 = String(imageBase64 ?? "").replace(/[^A-Za-z0-9+/=]/g, "");
  if (!safeBase64) {
    return NextResponse.json({ success: false, error: "Empty image data" }, { status: 400 });
  }

  const sniffed = detectMimeFromBase64(safeBase64);
  const safeMime = normalizeMime(mimeType, sniffed);

  const client = new Anthropic();

  // Try Sonnet (best vision) first; fall back to Haiku if Sonnet errors transiently.
  const models = ["claude-sonnet-4-6", "claude-haiku-4-5-20251001"];
  let lastErr: unknown = null;
  for (const model of models) {
    try {
      const data = await callModel(client, model, safeBase64, safeMime);
      // Coerce pid_last4 to last-4-digits even if model returned the full number.
      if (data.pid_last4) {
        const digits = String(data.pid_last4).replace(/\D/g, "");
        if (digits.length >= 4) data.pid_last4 = digits.slice(-4);
      } else if (data.order_number) {
        const digits = String(data.order_number).replace(/\D/g, "");
        if (digits.length >= 4) data.pid_last4 = digits.slice(-4);
      }
      return NextResponse.json({ success: true, data });
    } catch (err) {
      console.error(`OCR error on ${model}:`, err);
      lastErr = err;
      // Don't retry on auth / bad-image errors — those won't recover
      if (err instanceof Anthropic.APIError) {
        if (err.status === 401 || err.status === 403 || err.status === 400) break;
      }
    }
  }

  const message = lastErr instanceof Error ? lastErr.message : String(lastErr ?? "Analysis failed");
  const status =
    lastErr instanceof Anthropic.APIError && typeof lastErr.status === "number" ? lastErr.status : 500;
  return NextResponse.json({ success: false, error: message }, { status });
}
