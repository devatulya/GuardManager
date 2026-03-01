// ================================
// GuardManager – Flat Minimalist Theme
// Single Source of Truth
// ================================

// ----------------
// Base Palette
// ----------------
const baseColors = {
  // User provided palette
  mint: '#EFFFFB',
  green: '#50D890',
  blue: '#4F98CA',
  dark: '#272727',

  white: '#ffffff',
  black: '#000000',

  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate500: '#64748b',

  red500: '#ef4444',
};

// ----------------
// Global Theme
// ----------------
// Flattening to one strict theme
const appColors = {
  // Brand
  primary: baseColors.green,
  primarySoft: 'rgba(80, 216, 144, 0.12)',
  primaryVerify: baseColors.green,
  accent: baseColors.blue,

  // Surfaces
  background: baseColors.mint,
  surface: baseColors.white,
  surfaceSolid: baseColors.white,

  // Text
  text: baseColors.dark,
  textSecondary: baseColors.slate500,
  textMuted: baseColors.slate300,
  textInverse: baseColors.white,

  // Borders
  border: baseColors.slate200,
  borderSoft: 'rgba(39, 39, 39, 0.1)',
  borderHard: baseColors.slate200,

  // Status
  success: baseColors.green,
  danger: baseColors.red500,

  // ---- Legacy compatibility (DO NOT REMOVE)
  backgroundLight: baseColors.mint,
  backgroundDark: baseColors.dark,
  cardBackground: baseColors.white,
  headerBackground: baseColors.white,
  white: baseColors.white,

  slate50: baseColors.mint,
  slate100: baseColors.mint,
  slate200: baseColors.slate200,
  slate300: baseColors.slate300,
  slate400: baseColors.slate300,
  slate500: baseColors.slate500,
  slate600: baseColors.slate500,
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
  // Flat elevation based on the sketch layout
  clayRaised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  clayInset: {
    shadowColor: 'transparent', // Stripped inset
  },

  clayDeep: {
    shadowColor: baseColors.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ----------------
// Skeuo Dummies (Prevents Legacy Crashes)
// ----------------
const skeuo = {
  colors: {
    surfaceLight: baseColors.white,
    surfaceDark: baseColors.mint,
    divider: 'rgba(0,0,0,0.06)',
    text: baseColors.dark,
    textSecondary: baseColors.slate500,
    placeholder: baseColors.slate300,
  },
  surface: {
    backgroundColor: baseColors.white,
    borderTopWidth: 0,
    borderBottomWidth: 1, borderBottomColor: baseColors.slate200,
  },
  inset: {
    backgroundColor: baseColors.white,
    borderTopWidth: 1, borderTopColor: baseColors.slate200,
    borderBottomWidth: 0,
    borderRadius: borderRadius.m,
  },
  btnPrimary: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    shadowColor: baseColors.green,
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
