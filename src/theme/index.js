
// Base Colors (Unchanged Palette)
const baseColors = {
    indigo800: '#3730a3',
    indigo600: '#4f46e5',
    indigo500: '#6366f1',
    slate50: '#f8fafc',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate300: '#cbd5e1',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1e293b',
    slate900: '#0f172a',
    white: '#ffffff',
    black: '#000000',
    red600: '#dc2626',
    red500: '#ef4444',
    green600: '#16a34a',
    green500: '#22c55e',
};

// Light Theme Colors (Maps to existing hardcoded values mostly)
export const lightColors = {
    primary: baseColors.indigo800,
    primaryVerify: '#1111d4',
    backgroundLight: baseColors.slate50, // Screen background
    backgroundDark: baseColors.slate900,
    cardBackground: baseColors.white,
    headerBackground: baseColors.white,
    text: baseColors.slate900,
    textSecondary: baseColors.slate500,
    border: baseColors.slate100,
    white: baseColors.white,

    // Slates (as semantic tokens, but keep names for compatibility)
    slate50: baseColors.slate50,
    slate100: baseColors.slate100,
    slate200: baseColors.slate200,
    slate300: baseColors.slate300,
    slate400: baseColors.slate400,
    slate500: baseColors.slate500,
    slate600: baseColors.slate600,
    slate700: baseColors.slate700,
    slate800: baseColors.slate800,
    slate900: baseColors.slate900,

    danger: baseColors.red500,
    success: baseColors.green600,
};

// Dark Theme Colors
export const darkColors = {
    primary: baseColors.indigo500, // Lighter for dark mode
    primaryVerify: baseColors.indigo600,
    backgroundLight: baseColors.slate900, // Screen background
    backgroundDark: baseColors.black,
    cardBackground: baseColors.slate800,
    headerBackground: baseColors.slate900,
    text: baseColors.slate50,
    textSecondary: baseColors.slate400,
    border: baseColors.slate700,
    white: baseColors.slate800, // Dangerous alias if used for text color on primary, but needed if used for backgrounds

    // Inverted Slates for dark mode (experimental mapping)
    slate50: baseColors.slate900,
    slate100: baseColors.slate800,
    slate200: baseColors.slate700,
    slate300: baseColors.slate600,
    slate400: baseColors.slate500,
    slate500: baseColors.slate400,
    slate600: baseColors.slate300,
    slate700: baseColors.slate200,
    slate800: baseColors.slate100,
    slate900: baseColors.slate50,

    danger: baseColors.red500,
    success: baseColors.green500,
};

export const spacing = {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const borderRadius = {
    m: 8,
    l: 12,
    xl: 16,
    full: 9999,
};

// Default static export for legacy code (Light Mode)
export const colors = lightColors;

export const theme = {
    colors: lightColors,
    spacing,
    borderRadius,
};

// Dynamic Theme Helper
export const getTheme = (mode) => ({
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    borderRadius,
});
