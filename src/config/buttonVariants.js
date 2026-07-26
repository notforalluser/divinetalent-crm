// ============================================================================
// SINGLE SOURCE OF TRUTH FOR BUTTON STYLES
// Every <Button> in the app is built from this file. Change a value here
// (colors, radius, sizes, hover states...) and EVERY button using that
// variant/size updates across the whole website automatically.
// ============================================================================

export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap " +
  "rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-crimson-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper " +
  "disabled:opacity-50 disabled:pointer-events-none select-none";

export const BUTTON_VARIANTS = {
  primary: "bg-crimson-500 text-white hover:bg-crimson-600 active:bg-crimson-700 shadow-sm",
  dark: "bg-ink text-white hover:bg-black active:bg-black shadow-sm",
  outline: "border border-line bg-paper text-ink hover:bg-cloud active:bg-cloud-dark",
  ghost: "bg-transparent text-ink hover:bg-cloud active:bg-cloud-dark",
  subtle: "bg-crimson-50 text-crimson-600 hover:bg-crimson-100",
  danger: "bg-white text-crimson-600 border border-crimson-100 hover:bg-crimson-50",
  link: "bg-transparent text-crimson-600 hover:text-crimson-700 underline-offset-4 hover:underline p-0",
};

export const BUTTON_SIZES = {
  sm: "text-xs px-3 py-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5",
  md: "text-sm px-4 py-2 [&_svg]:h-4 [&_svg]:w-4",
  lg: "text-sm px-5 py-3 [&_svg]:h-4.5 [&_svg]:w-4.5",
  icon: "p-2 [&_svg]:h-4 [&_svg]:w-4",
};
