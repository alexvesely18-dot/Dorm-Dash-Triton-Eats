import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isBase64SizeOk } from "@/lib/validate";

// Allow up to 60s — Anthropic vision calls can take 15-20s on larger images
export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type AllowedMime = typeof ALLOWED_MIME_TYPES[number];

function normalizeMime(raw: unknown): AllowedMime {
  if (ALLOWED_MIME_TYPES.includes(raw as AllowedMime)) return raw as AllowedMime;
  return "image/jpeg";
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "analyze-screenshot", 10, 60_000)) {
    return NextResponse.json({ success: false, error: "Too many requests. Try again in 1 minute." }, { status: 429 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ success: false, error: "No API key configured" });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;

  if (!isBase64SizeOk(imageBase64, 10_000_000)) {
    return NextResponse.json({ success: false, error: "Image too large (max 10 MB)" }, { status: 413 });
  }

  // Strip any non-base64 characters
  const safeBase64 = String(imageBase64 ?? "").replace(/[^A-Za-z0-9+/=]/g, "");
  if (!safeBase64) {
    return NextResponse.json({ success: false, error: "Empty image data" }, { status: 400 });
  }

  const safeMime = normalizeMime(mimeType);
  const client = new Anthropic();

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: safeMime,
                data: safeBase64,
              },
            },
            {
              type: "text",
              text: `This is a screenshot from the UCSD Triton2Go dining app receipt. Extract these fields and return ONLY valid JSON with no markdown or explanation:
{
  "pid_last4": "LAST 4 DIGITS ONLY of the transaction/receipt number shown after the # symbol at the top of the receipt (e.g. if the receipt shows #121358263 then pid_last4 is '8263'). This is a 9-digit number. Extract only the final 4 digits as a string.",
  "order_number": "the full transaction number shown after # (e.g. '121358263')",
  "dining_hall": "name of the dining location (e.g. 'Bistro', '64 Degrees')",
  "items": ["each food item ordered, as a string"],
  "pickup_time": "pickup or order time if shown (e.g. '1:02 PM')",
  "total": "order total dollar amount if visible (e.g. '$16.00')"
}
Use null for any field not visible. For pid_last4 always return exactly 4 digit characters.`,
            },
          ],
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    // Find the first JSON object in the response, ignoring any surrounding text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object in response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("OCR error:", err);
    return NextResponse.json(
      { success: false, error: "Analysis failed" },
      { status: 500 }
    );
  }
}
