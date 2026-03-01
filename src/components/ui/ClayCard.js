import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * ClayCard — claymorphism card container
 *
 * Props:
 *   children   — card content
 *   style      — additional styles
 *   variant    — 'default' | 'primary' | 'success' | 'danger'
 *   theme      — optional override (falls back to useTheme)
 *   noPadding  — skip default padding
 */
export default function ClayCard({
    children,
    style,
    variant = 'default',
    theme: themeProp,
    noPadding = false,
}) {
    const { theme: ctxTheme } = useTheme();
    const theme = themeProp || ctxTheme;
    const styles = getStyles(theme, variant, noPadding);

    return <View style={[styles.card, style]}>{children}</View>;
}

function getSurfaceColor(theme, variant) {
    switch (variant) {
        case 'primary':
            return theme.colors.primarySoft;
        case 'success':
            return 'rgba(34,197,94,0.10)';
        case 'danger':
            return 'rgba(239,68,68,0.10)';
        default:
            return theme.colors.surfaceSolid;
    }
}

function getStyles(theme, variant, noPadding) {
    return StyleSheet.create({
        card: {
            backgroundColor: getSurfaceColor(theme, variant),
            borderRadius: theme.borderRadius.l,
            padding: noPadding ? 0 : theme.spacing.m,
            borderWidth: 1,
            borderColor: theme.colors.borderSoft,
            // Clay raised shadow
            ...theme.shadows.clayRaised,
        },
    });
}
