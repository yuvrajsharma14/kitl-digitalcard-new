export const SOCIAL_PLATFORMS = [
  { value: "LINKEDIN", label: "LinkedIn", baseUrl: "https://linkedin.com/in/" },
  { value: "TWITTER", label: "Twitter / X", baseUrl: "https://twitter.com/" },
  { value: "INSTAGRAM", label: "Instagram", baseUrl: "https://instagram.com/" },
  { value: "FACEBOOK", label: "Facebook", baseUrl: "https://facebook.com/" },
  { value: "GITHUB", label: "GitHub", baseUrl: "https://github.com/" },
  { value: "YOUTUBE", label: "YouTube", baseUrl: "https://youtube.com/@" },
  { value: "TIKTOK", label: "TikTok", baseUrl: "https://tiktok.com/@" },
  { value: "OTHER", label: "Other", baseUrl: "" },
] as const;

export const CARD_THEMES = [
  { value: "default", label: "Default", primaryColor: "#2563eb" },
  { value: "dark", label: "Dark", primaryColor: "#1e293b" },
  { value: "green", label: "Green", primaryColor: "#16a34a" },
  { value: "purple", label: "Purple", primaryColor: "#7c3aed" },
  { value: "rose", label: "Rose", primaryColor: "#e11d48" },
] as const;

export const MAX_CARDS_PER_USER = 5;
export const MAX_SOCIAL_LINKS = 10;
export const MAX_BIO_LENGTH = 500;
