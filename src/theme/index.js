// ================================
// GuardManager – Flat Minimalist Theme
// Single Source of Truth
// ================================

// ----------------
// Base Palette
// ----------------
const baseColors = {
  bg: '#EFFFFB',
  primary: '#50D890',
  secondary: '#4F98CA',
  dark: '#272727',
};

// ----------------
// Global Theme
// ----------------
const appColors = {
  // Brand
  primary: baseColors.primary,
  primarySoft: 'rgba(80, 216, 144, 0.12)',
  primaryVerify: baseColors.primary,
  accent: baseColors.secondary,

  // Surfaces
  background: baseColors.bg,
  surface: baseColors.bg,
  surfaceSolid: baseColors.bg,

  // Text
  text: baseColors.dark,
  textSecondary: baseColors.secondary,
  textMuted: baseColors.secondary,
  textInverse: baseColors.bg,

  // Borders
  border: baseColors.secondary,
  borderSoft: 'rgba(79, 152, 202, 0.3)',
  borderHard: baseColors.secondary,

  // Status
  success: baseColors.primary,
  danger: baseColors.secondary, // Enforcing 4-color palette only
  error: '#ef4444',             // Explicit red for negative values

  // ---- Legacy compatibility
  backgroundLight: baseColors.bg,
  backgroundDark: baseColors.dark,
  cardBackground: baseColors.bg,
  headerBackground: baseColors.bg,
  white: baseColors.bg,

  slate50: baseColors.bg,
  slate100: baseColors.bg,
  slate200: baseColors.secondary,
  slate300: baseColors.secondary,
  slate400: baseColors.secondary,
  slate500: baseColors.dark,
  slate600: baseColors.dark,
  slate700: baseColors.dark,
  slate800: baseColors.dark,
  slate900: baseColors.dark,
};

// ----------------
// Spacing
// ----------------
const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  section: 40,
};

// ----------------
// Border Radius
// ----------------
const borderRadius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  pill: 9999,
};

// ----------------
// Flat Shadows
// ----------------
const shadows = {
  clayRaised: {
    shadowColor: baseColors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clayInset: {
    shadowColor: 'transparent',
  },
  clayDeep: {
    shadowColor: baseColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ----------------
// Skeuo Dummies
// ----------------
const skeuo = {
  colors: {
    surfaceLight: baseColors.bg,
    surfaceDark: baseColors.bg,
    divider: 'rgba(39, 39, 39, 0.1)',
    text: baseColors.dark,
    textSecondary: baseColors.secondary,
    placeholder: baseColors.secondary,
  },
  surface: {
    backgroundColor: baseColors.bg,
    borderTopWidth: 0,
    borderBottomWidth: 1, borderBottomColor: baseColors.secondary,
  },
  inset: {
    backgroundColor: baseColors.bg,
    borderTopWidth: 1, borderTopColor: baseColors.secondary,
    borderBottomWidth: 0,
    borderRadius: borderRadius.m,
  },
  btnPrimary: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    shadowColor: baseColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: borderRadius.l,
  },
  textEngraved: {
    textShadowColor: 'transparent',
    textShadowRadius: 0,
  }
};

// ----------------
// Public Exports
// ----------------
export const colors = appColors;

export const theme = {
  colors: appColors,
  spacing,
  borderRadius,
  shadows,
  skeuo,
};

export const getTheme = (mode) => ({
  colors: appColors, // Uniform theme regardless of device setting for now
  spacing,
  borderRadius,
  shadows,
  skeuo,
});
