export type CardLayout     = "classic" | "modern" | "minimal" | "bold" | "elegant" | "sharp" | "profile" | "sidepanel";
export type CardFontFamily = "inter" | "poppins" | "roboto" | "playfair" | "montserrat";

// Every field that can appear on a card. `name` is always required
// so it is intentionally excluded from this toggle set.
export interface TemplateFields {
  // Media
  headshot: boolean;
  logo:     boolean;
  banner:   boolean;
  // Identity
  jobTitle: boolean;
  company:  boolean;
  tagline:  boolean;
  bio:      boolean;
  // Contact
  email:    boolean;
  phone:    boolean;
  website:  boolean;
  // Social
  linkedin: boolean;
  facebook: boolean;
  instagram: boolean;
  twitter:  boolean;
}

export interface TemplateConfig {
  layout:          CardLayout;
  backgroundColor: string;
  textColor:       string;
  accentColor:     string;
  fontFamily:      CardFontFamily;
  fields?:         TemplateFields; // optional — older templates without fields show all
}

// ─── Default values ────────────────────────────────────────────────────────────

export const DEFAULT_TEMPLATE_FIELDS: TemplateFields = {
  headshot: true,
  logo:     true,
  banner:   true,
  jobTitle: true,
  company:  true,
  tagline:  false,
  bio:      false,
  email:    true,
  phone:    true,
  website:  true,
  linkedin: true,
  facebook: true,
  instagram: true,
  twitter:  true,
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  layout:          "classic",
  backgroundColor: "#ffffff",
  textColor:       "#1a1a2e",
  accentColor:     "#6366f1",
  fontFamily:      "inter",
  fields:          DEFAULT_TEMPLATE_FIELDS,
};

// ─── UI metadata ───────────────────────────────────────────────────────────────

export const LAYOUT_OPTIONS: {
  value: CardLayout;
  label: string;
  description: string;
}[] = [
  { value: "classic",   label: "Classic",    description: "Centered, avatar at top"        },
  { value: "modern",    label: "Modern",     description: "Avatar left, info right"        },
  { value: "minimal",   label: "Minimal",    description: "Clean, text-focused"            },
  { value: "bold",      label: "Bold",       description: "Large banner, overlay text"     },
  { value: "elegant",   label: "Elegant",    description: "Accent stripe, refined lines"   },
  { value: "sharp",     label: "Sharp",      description: "Bold contrast header panel"     },
  { value: "profile",   label: "Profile",    description: "Social-card style, centred"     },
  { value: "sidepanel", label: "Side Panel", description: "Accent sidebar, details right"  },
];

export const FONT_OPTIONS: { value: CardFontFamily; label: string }[] = [
  { value: "inter",      label: "Inter" },
  { value: "poppins",    label: "Poppins" },
  { value: "roboto",     label: "Roboto" },
  { value: "playfair",   label: "Playfair Display" },
  { value: "montserrat", label: "Montserrat" },
];

export const FONT_FAMILY_CSS: Record<CardFontFamily, string> = {
  inter:      "'Inter', sans-serif",
  poppins:    "'Poppins', sans-serif",
  roboto:     "'Roboto', sans-serif",
  playfair:   "'Playfair Display', serif",
  montserrat: "'Montserrat', sans-serif",
};

// Field group definitions used in the form UI
export const FIELD_GROUPS: {
  label:  string;
  fields: { key: keyof TemplateFields; label: string }[];
}[] = [
  {
    label: "Media",
    fields: [
      { key: "banner",   label: "Business Banner" },
      { key: "headshot", label: "Person Headshot" },
      { key: "logo",     label: "Business Logo" },
    ],
  },
  {
    label: "Identity",
    fields: [
      { key: "jobTitle", label: "Job Title" },
      { key: "company",  label: "Company" },
      { key: "tagline",  label: "Tagline (max 80 chars)" },
      { key: "bio",      label: "Bio / About" },
    ],
  },
  {
    label: "Contact",
    fields: [
      { key: "email",   label: "Email" },
      { key: "phone",   label: "Phone" },
      { key: "website", label: "Website" },
    ],
  },
  {
    label: "Social Links",
    fields: [
      { key: "linkedin",  label: "LinkedIn" },
      { key: "facebook",  label: "Facebook" },
      { key: "instagram", label: "Instagram" },
      { key: "twitter",   label: "X (Twitter)" },
    ],
  },
];
