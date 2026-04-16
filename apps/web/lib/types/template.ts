export type CardLayout = "classic" | "modern" | "minimal" | "bold";
export type CardFontFamily = "inter" | "poppins" | "roboto" | "playfair" | "montserrat";

export interface TemplateConfig {
  layout: CardLayout;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: CardFontFamily;
}

export const LAYOUT_OPTIONS: {
  value: CardLayout;
  label: string;
  description: string;
}[] = [
  { value: "classic", label: "Classic", description: "Centered, avatar at top" },
  { value: "modern", label: "Modern", description: "Avatar left, info right" },
  { value: "minimal", label: "Minimal", description: "Clean, text-focused" },
  { value: "bold", label: "Bold", description: "Large banner, overlay text" },
];

export const FONT_OPTIONS: { value: CardFontFamily; label: string }[] = [
  { value: "inter", label: "Inter" },
  { value: "poppins", label: "Poppins" },
  { value: "roboto", label: "Roboto" },
  { value: "playfair", label: "Playfair Display" },
  { value: "montserrat", label: "Montserrat" },
];

export const FONT_FAMILY_CSS: Record<CardFontFamily, string> = {
  inter: "'Inter', sans-serif",
  poppins: "'Poppins', sans-serif",
  roboto: "'Roboto', sans-serif",
  playfair: "'Playfair Display', serif",
  montserrat: "'Montserrat', sans-serif",
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  layout: "classic",
  backgroundColor: "#ffffff",
  textColor: "#1a1a2e",
  accentColor: "#6366f1",
  fontFamily: "inter",
};
