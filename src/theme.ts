import { argbFromHex, Hct, hexFromArgb, SchemeTonalSpot } from "@material/material-color-utilities";

// Google HCT roles keep the graph, stable M3 components, and Expressive labs
// on the same accessible dark color scheme.
const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex("#8b80f9")), true, 0, "2025");
export const materialColors = {
  primary: scheme.primary,
  onPrimary: scheme.onPrimary,
  primaryContainer: scheme.primaryContainer,
  onPrimaryContainer: scheme.onPrimaryContainer,
  secondary: scheme.secondary,
  onSecondary: scheme.onSecondary,
  secondaryContainer: scheme.secondaryContainer,
  onSecondaryContainer: scheme.onSecondaryContainer,
  tertiary: scheme.tertiary,
  onTertiary: scheme.onTertiary,
  tertiaryContainer: scheme.tertiaryContainer,
  onTertiaryContainer: scheme.onTertiaryContainer,
  surface: scheme.surface,
  surfaceDim: scheme.surfaceDim,
  surfaceBright: scheme.surfaceBright,
  surfaceContainerLowest: scheme.surfaceContainerLowest,
  surfaceContainerLow: scheme.surfaceContainerLow,
  surfaceContainer: scheme.surfaceContainer,
  surfaceContainerHigh: scheme.surfaceContainerHigh,
  surfaceContainerHighest: scheme.surfaceContainerHighest,
  onSurface: scheme.onSurface,
  onSurfaceVariant: scheme.onSurfaceVariant,
  outline: scheme.outline,
  outlineVariant: scheme.outlineVariant,
  inverseSurface: scheme.inverseSurface,
  inverseOnSurface: scheme.inverseOnSurface,
  inversePrimary: scheme.inversePrimary,
  error: scheme.error,
  onError: scheme.onError,
  shadow: scheme.shadow,
  scrim: scheme.scrim,
};

export function applyMaterialTheme(element: HTMLElement) {
  for (const [role, argb] of Object.entries(materialColors)) {
    const name = role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    element.style.setProperty(`--md-sys-color-${name}`, hexFromArgb(argb));
  }
  for (const [region, color] of Object.entries(graphTrackColors)) {
    element.style.setProperty(`--graph-track-${region}`, hexFromArgb(color));
  }
}

// Categorical tracks use the same Google color algorithm as the UI. Their
// identity survives Trace toggles and node selection, as in a Git graph.
export const graphTrackColors = Object.fromEntries(Object.entries({
  india: "#be9c58", china: "#8b80f9", japan: "#4eaaa0", "modern-china": "#d783a8",
}).map(([region, seed]) => [region, new SchemeTonalSpot(Hct.fromInt(argbFromHex(seed)), true, 0, "2025").primary]));
