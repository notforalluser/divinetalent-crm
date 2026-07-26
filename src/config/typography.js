// ============================================================================
// SINGLE SOURCE OF TRUTH FOR TEXT SIZES
// Every <Heading> / <Text> in the app pulls its classes from this file.
// Change a value here and the size updates everywhere it's used.
// ============================================================================
export const TYPE_SCALE = {
  display: "text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]",
  h1: "text-2xl md:text-3xl font-bold tracking-tight leading-tight",
  h2: "text-xl md:text-2xl font-bold tracking-tight leading-snug",
  h3: "text-lg md:text-xl font-semibold leading-snug",
  h4: "text-base md:text-lg font-semibold leading-snug",
  eyebrow: "text-[11px] font-semibold uppercase tracking-[0.14em]",
  bodyLg: "text-base leading-relaxed",
  body: "text-sm leading-relaxed",
  small: "text-xs leading-normal",
  micro: "text-[11px] leading-normal",
  stat: "text-3xl md:text-4xl font-bold tracking-tight",
};

export const TYPE_COLOR = {
  primary: "text-ink",
  soft: "text-ink-soft",
  muted: "text-slate",
  accent: "text-crimson-600",
  onDark: "text-white",
  onDarkMuted: "text-white/70",
};
