import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isBase64SizeOk, isOneOf, sanitizeText } from "@/lib/validate";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;

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

  if (!isOneOf(mimeType, [...ALLOWED_MIME_TYPES])) {
    return NextResponse.json({ success: false, error: "Unsupported image type" }, { status: 400 });
  }

  if (!isBase64SizeOk(imageBase64, 10_000_000)) {
    return NextResponse.json({ success: false, error: "Image too large (max 10 MB)" }, { status: 413 });
  }

  const safeBase64 = sanitizeText(imageBase64 as string, 15_000_000).replace(/[^A-Za-z0-9+/=]/g, "");

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
                media_type: mimeType as typeof ALLOWED_MIME_TYPES[number],
                data: safeBase64,
              },
            },
            {
              type: "text",
              text: `This is a screenshot from the UCSD Triton2Go dining app. Extract these fields and return ONLY valid JSON with no markdown or explanation:
{
  "pid_last4": "last 4 digits of student PID/ID number",
  "order_number": "order or confirmation number",
  "dining_hall": "name of the dining hall",
  "items": ["item 1", "item 2"],
  "pickup_time": "target pickup time",
  "total": "order total if visible"
}
Use null for any field not visible or unclear.`,
            },
          ],
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const jsonStr = raw
      .replace(/^```json?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("OCR error:", err);
    return NextResponse.json(
      { success: false, error: "Analysis failed" },
      { status: 500 }
    );
  }
}
