import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  frontImageBase64: z.string().optional(),
  backImageBase64:  z.string().optional(),
  text:             z.string().optional(),
});

const SYSTEM_PROMPT = `You are a business card data extractor.
Extract structured information from the input (one or two card images, or text) and return ONLY a JSON object.
Return ONLY the JSON, no explanation, no markdown, no code fences.
The JSON must have these optional fields:
{
  "displayName": "Full Name",
  "jobTitle": "Job Title",
  "company": "Company Name",
  "bio": "Short bio (max 200 chars, only if clearly present)",
  "email": "email@example.com",
  "phone": "+1234567890",
  "website": "https://example.com",
  "socialLinks": [
    { "platform": "LINKEDIN", "url": "https://linkedin.com/in/...", "order": 0 },
    { "platform": "TWITTER",  "url": "https://twitter.com/...",   "order": 1 }
  ]
}
Platform values must be one of: LINKEDIN, TWITTER, INSTAGRAM, FACEBOOK, GITHUB, YOUTUBE, TIKTOK, OTHER.
If two card images are provided, extract from both and merge the results (front usually has name/title, back may have contact details).
Omit any field you cannot confidently extract. Never fabricate data.`;

function parseImageDataUri(dataUri: string): { mediaType: string; base64Data: string } | null {
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return null;
  return { mediaType: match[1], base64Data: match[2] };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI extraction is not configured. Please add your ANTHROPIC_API_KEY." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success || (!parsed.data.frontImageBase64 && !parsed.data.backImageBase64 && !parsed.data.text)) {
    return NextResponse.json({ error: "Provide at least one image or text." }, { status: 400 });
  }

  const { frontImageBase64, backImageBase64, text } = parsed.data;

  // Build the message content — can include up to 2 images
  const content: unknown[] = [];

  if (frontImageBase64) {
    const img = parseImageDataUri(frontImageBase64);
    if (!img) return NextResponse.json({ error: "Invalid front image format." }, { status: 400 });
    content.push({
      type: "image",
      source: { type: "base64", media_type: img.mediaType, data: img.base64Data },
    });
    content.push({ type: "text", text: "This is the FRONT of the business card." });
  }

  if (backImageBase64) {
    const img = parseImageDataUri(backImageBase64);
    if (!img) return NextResponse.json({ error: "Invalid back image format." }, { status: 400 });
    content.push({
      type: "image",
      source: { type: "base64", media_type: img.mediaType, data: img.base64Data },
    });
    content.push({ type: "text", text: "This is the BACK of the business card." });
  }

  if (text) {
    content.push({
      type: "text",
      text: `Extract business card information from this text:\n\n${text}`,
    });
  }

  if (frontImageBase64 || backImageBase64) {
    content.push({
      type: "text",
      text: "Extract all business card information from these images and return the merged JSON.",
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI extraction failed. Please fill in manually." }, { status: 500 });
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text ?? "{}";

    let extracted: Record<string, unknown> = {};
    try {
      extracted = JSON.parse(rawText);
    } catch {
      // If JSON parse fails, return empty so user fills manually
    }

    return NextResponse.json({ extracted });
  } catch {
    return NextResponse.json({ error: "AI extraction failed. Please fill in manually." }, { status: 500 });
  }
}
