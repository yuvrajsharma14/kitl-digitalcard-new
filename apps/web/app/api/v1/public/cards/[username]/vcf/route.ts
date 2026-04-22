import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// vCard 3.0 line folding — spec requires lines > 75 chars to wrap at 75
// with CRLF + single space continuation
function fold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  chunks.push(line.slice(0, 75));
  let pos = 75;
  while (pos < line.length) {
    chunks.push(" " + line.slice(pos, pos + 74));
    pos += 74;
  }
  return chunks.join("\r\n");
}

// Escape special chars in vCard text values
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g,  "\\,")
    .replace(/;/g,  "\\;")
    .replace(/\n/g, "\\n");
}

function buildVCard(card: {
  displayName:  string;
  jobTitle:     string | null;
  company:      string | null;
  bio:          string | null;
  email:        string | null;
  phone:        string | null;
  website:      string | null;
  avatarUrl:    string | null;
  slug:         string;
  socialLinks:  { platform: string; url: string }[];
}, publicUrl: string): string {
  const lines: string[] = [];

  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");

  // Full name + structured name
  lines.push(fold(`FN:${esc(card.displayName)}`));
  // N: family;given;additional;prefix;suffix  — best-effort split on space
  const nameParts = card.displayName.trim().split(/\s+/);
  const given  = nameParts[0] ?? "";
  const family = nameParts.slice(1).join(" ");
  lines.push(fold(`N:${esc(family)};${esc(given)};;;`));

  if (card.jobTitle) lines.push(fold(`TITLE:${esc(card.jobTitle)}`));
  if (card.company)  lines.push(fold(`ORG:${esc(card.company)}`));
  if (card.bio)      lines.push(fold(`NOTE:${esc(card.bio)}`));

  if (card.email) lines.push(fold(`EMAIL;type=INTERNET;type=PREF:${card.email}`));
  if (card.phone) lines.push(fold(`TEL;type=CELL:${card.phone}`));

  if (card.website) {
    const url = card.website.startsWith("http") ? card.website : `https://${card.website}`;
    lines.push(fold(`URL;type=WORK:${url}`));
  }

  // Digital card profile URL
  lines.push(fold(`URL;type=PROFILE:${publicUrl}`));

  // Social links — map platform to X-SOCIALPROFILE type
  const platformTypeMap: Record<string, string> = {
    LINKEDIN:  "linkedin",
    TWITTER:   "twitter",
    INSTAGRAM: "instagram",
    FACEBOOK:  "facebook",
    GITHUB:    "github",
    YOUTUBE:   "youtube",
    TIKTOK:    "tiktok",
  };
  for (const link of card.socialLinks) {
    const type = platformTypeMap[link.platform];
    const url  = link.url.startsWith("http") ? link.url : `https://${link.url}`;
    if (type) {
      lines.push(fold(`X-SOCIALPROFILE;type=${type}:${url}`));
    } else {
      lines.push(fold(`URL:${url}`));
    }
  }

  // Avatar — only include if it's a real URL (not base64) and reasonably short
  if (card.avatarUrl && card.avatarUrl.startsWith("http") && card.avatarUrl.length < 500) {
    lines.push(fold(`PHOTO;VALUE=URI:${card.avatarUrl}`));
  }

  lines.push("END:VCARD");

  // vCard spec requires CRLF line endings
  return lines.join("\r\n") + "\r\n";
}

export async function GET(
  _req: Request,
  { params }: { params: { username: string } }
) {
  const card = await prisma.card.findFirst({
    where:   { slug: params.username, isPublished: true },
    select: {
      displayName: true,
      jobTitle:    true,
      company:     true,
      bio:         true,
      email:       true,
      phone:       true,
      website:     true,
      avatarUrl:   true,
      slug:        true,
      socialLinks: { select: { platform: true, url: true }, orderBy: { order: "asc" } },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const publicUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3002"}/u/${card.slug}`;
  const vcf = buildVCard(card, publicUrl);

  return new Response(vcf, {
    status: 200,
    headers: {
      "Content-Type":        "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${card.slug}.vcf"`,
      "Cache-Control":       "no-store",
    },
  });
}
