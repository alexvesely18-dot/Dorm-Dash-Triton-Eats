import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

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
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
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
