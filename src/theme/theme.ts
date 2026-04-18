/**
 * Core Design System: Theme, Typography, and Tokens.
 * 
 * Provides a centralized source of truth for the application's visual identity,
 * including high-fidelity color schemes, responsive typography scales, 
 * consistent spacing grids, and component-ready border radii.
 */

// ─── Brand Primary (Color.kt) ──────────────────────────────────────────────────
const Primary = '#2F3E46';
const PrimaryDark = '#8EAAB4';

// ─── Backgrounds (Color.kt) ────────────────────────────────────────────────────
const BackgroundLight = '#F8F9FA';
const BackgroundDark = '#121212';

// ─── Surfaces (Color.kt) ──────────────────────────────────────────────────────
const SurfaceLight = '#FFFFFF';
const SurfaceDark = '#1E1E1E';
const SurfaceVariantLight = '#F1F5F9'; // slate-100
const SurfaceVariantDark = '#2A2A2A';

// ─── Text / On-Colors (Color.kt) ──────────────────────────────────────────────
const TextPrimaryLight = '#0F172A';
const TextPrimaryDark = '#E2E2E2';
const TextSecondaryLight = '#64748B';
const TextSecondaryDark = '#9CA3AF';
const TextTertiaryLight = '#94A3B8'; // slate-400
const TextTertiaryDark = '#6B7280';

// ─── Borders / Outlines (Color.kt) ───────────────────────────────────────────
const BorderLight = '#E2E8F0';
const BorderDark = '#3A3A3A';
const OutlineVariantLight = '#DEE2E6';
const OutlineVariantDark = '#444444';

// ─── Status Colors (Color.kt) ────────────────────────────────────────────────
const SuccessBg = '#DCFCE7';
const SuccessText = '#15803D';
const SuccessBgDark = '#1A3A2A';
const SuccessTextDark = '#4ADE80';

const WarningBg = '#FEF3C7';
const WarningText = '#B45309';
const WarningBgDark = '#3D2E0A';
const WarningTextDark = '#FBBF24';

const ErrorColor = '#B3261E';
const ErrorColorDark = '#EF5350';
const ErrorBg = '#FEF2F2'; // red-50
const ErrorBgDark = '#3A1A1A';

const ActionBlueBg = '#DBEAFE';
const ActionBlueText = '#2563EB';
const ActionBlueBgDark = '#1E2D4A';
const ActionBlueTextDark = '#60A5FA';

// ─── Light Color Scheme (Theme.kt → LightColorScheme) ───────────────────────
export const lightColors = {
  primary: Primary,
  background: BackgroundLight,
  surface: SurfaceLight,
  surfaceVariant: SurfaceVariantLight,
  onPrimary: '#FFFFFF',
  onBackground: TextPrimaryLight,
  onSurface: TextPrimaryLight,
  onSurfaceVariant: TextSecondaryLight,
  outline: BorderLight,
  outlineVariant: OutlineVariantLight,
  error: ErrorColor,

  // Extended colors (Theme.kt → LightExtended)
  textSecondary: TextSecondaryLight,
  textTertiary: TextTertiaryLight,
  successBg: SuccessBg,
  successText: SuccessText,
  warningBg: WarningBg,
  warningText: WarningText,
  errorBg: ErrorBg,
  errorText: ErrorColor,
  infoBg: ActionBlueBg,
  infoText: ActionBlueText,
  brandPrimary: Primary,
};

// ─── Dark Color Scheme (Theme.kt → DarkColorScheme) ─────────────────────────
export const darkColors = {
  primary: PrimaryDark,
  background: BackgroundDark,
  surface: SurfaceDark,
  surfaceVariant: SurfaceVariantDark,
  onPrimary: '#121212',
  onBackground: TextPrimaryDark,
  onSurface: TextPrimaryDark,
  onSurfaceVariant: TextSecondaryDark,
  outline: BorderDark,
  outlineVariant: OutlineVariantDark,
  error: ErrorColorDark,

  // Extended colors (Theme.kt → DarkExtended)
  textSecondary: TextSecondaryDark,
  textTertiary: TextTertiaryDark,
  successBg: SuccessBgDark,
  successText: SuccessTextDark,
  warningBg: WarningBgDark,
  warningText: WarningTextDark,
  errorBg: ErrorBgDark,
  errorText: ErrorColorDark,
  infoBg: ActionBlueBgDark,
  infoText: ActionBlueTextDark,
  brandPrimary: PrimaryDark,
};

export type AppColors = typeof lightColors;

// ─── Typography (Type.kt) ───────────────────────────────────────────────────
// Font family: Default system font as placeholder for Inter (matching AppFontFamily = FontFamily.Default)
export const typography = {
  titleLarge: {
    fontWeight: '700' as const, // FontWeight.Bold
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  labelSmall: {
    fontWeight: '600' as const, // FontWeight.SemiBold
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelMedium: {
    fontWeight: '500' as const, // FontWeight.Medium
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontWeight: '400' as const, // FontWeight.Normal
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodyLarge: {
    fontWeight: '400' as const, // FontWeight.Normal
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
};

// ─── Spacing (extracted from dp values across components) ───────────────────
export const spacing = {
  xs: 2,   // Spacer 2.dp
  sm: 4,   // Spacer 4.dp
  md: 8,   // padding 8.dp, gap-2
  lg: 12,  // padding 12.dp, gap-3
  xl: 16,  // padding 16.dp, gap-4
  xxl: 24, // padding 24.dp
  xxxl: 48, // EmptyStateMessage inner padding
} as const;

// ─── Border Radii (extracted from RoundedCornerShape values) ────────────────
export const borderRadii = {
  sm: 4,
  md: 8,     // RoundedCornerShape(8.dp) — ProjectCard, icon bg
  lg: 12,    // RoundedCornerShape(12.dp) — ExpenseItemCard, EmptyState
  full: 9999, // RoundedCornerShape(percent = 50) — StatusBadge pill
} as const;

// ─── Complete Theme Object ──────────────────────────────────────────────────
export const theme = {
  light: lightColors,
  dark: darkColors,
  typography,
  spacing,
  borderRadii,
};

export default theme;
