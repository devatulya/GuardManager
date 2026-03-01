import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * ClayBadge — pill badge for status labels
 *
 * Props:
 *   label    — text to display
 *   variant  — 'success' | 'danger' | 'warning' | 'neutral' | 'primary'
 *   theme    — optional override
 *   small    — smaller size
 */
export default function ClayBadge({
    label,
    variant = 'neutral',
    theme: themeProp,
    small = false,
}) {
    const { theme: ctxTheme } = useTheme();
    const theme = themeProp || ctxTheme;
    const styles = getStyles(theme, variant, small);

    return (
        <View style={styles.badge}>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const VARIANT_COLORS = {
    success: { bg: 'rgba(34,197,94,0.15)', text: '#15803d', dot: '#22c55e' },
    danger: { bg: 'rgba(239,68,68,0.15)', text: '#dc2626', dot: '#ef4444' },
    warning: { bg: 'rgba(234,179,8,0.15)', text: '#b45309', dot: '#eab308' },
    neutral: { bg: 'rgba(100,116,139,0.12)', text: '#475569', dot: '#94a3b8' },
    primary: { bg: 'rgba(99,102,241,0.15)', text: '#4338ca', dot: '#6366f1' },
};

function getStyles(theme, variant, small) {
    const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.neutral;
    return StyleSheet.create({
        badge: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: colors.bg,
            borderRadius: theme.borderRadius.pill,
            paddingHorizontal: small ? 8 : 10,
            paddingVertical: small ? 2 : 4,
        },
        label: {
            fontSize: small ? 10 : 12,
            fontWeight: '600',
            color: colors.text,
            letterSpacing: 0.2,
        },
    });
}
