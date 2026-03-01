import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * ClayButton — pressable button with clay shadow and press-depth animation
 *
 * Props:
 *   label    — button text
 *   onPress  — press handler
 *   variant  — 'primary' | 'secondary' | 'ghost' | 'danger'
 *   icon     — React element rendered before label
 *   loading  — show spinner instead of label
 *   disabled — disable interaction
 *   theme    — optional override
 *   style    — additional container styles
 *   fullWidth — stretch to fill container
 */
export default function ClayButton({
    label,
    onPress,
    variant = 'primary',
    icon,
    loading = false,
    disabled = false,
    theme: themeProp,
    style,
    fullWidth = false,
}) {
    const { theme: ctxTheme } = useTheme();
    const theme = themeProp || ctxTheme;
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 6,
        }).start();
    };

    const styles = getStyles(theme, variant, disabled, fullWidth);

    return (
        <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { width: '100%' }]}>
            <Pressable
                onPress={disabled || loading ? undefined : onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.button, style]}
                accessibilityRole="button"
                accessibilityState={{ disabled: disabled || loading }}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'primary' || variant === 'danger' ? '#fff' : theme.colors.primary}
                        size="small"
                    />
                ) : (
                    <View style={styles.inner}>
                        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
                        <Text style={styles.label}>{label}</Text>
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
}

function getButtonColors(theme, variant) {
    switch (variant) {
        case 'primary':
            return {
                bg: theme.colors.primary,
                text: '#ffffff',
                border: 'transparent',
                shadow: theme.shadows.clayDeep,
            };
        case 'secondary':
            return {
                bg: theme.colors.surfaceSolid,
                text: theme.colors.primary,
                border: theme.colors.borderHard,
                shadow: theme.shadows.clayRaised,
            };
        case 'ghost':
            return {
                bg: 'transparent',
                text: theme.colors.primary,
                border: 'transparent',
                shadow: {},
            };
        case 'danger':
            return {
                bg: theme.colors.danger,
                text: '#ffffff',
                border: 'transparent',
                shadow: theme.shadows.clayRaised,
            };
        default:
            return {
                bg: theme.colors.primary,
                text: '#ffffff',
                border: 'transparent',
                shadow: theme.shadows.clayDeep,
            };
    }
}

function getStyles(theme, variant, disabled, fullWidth) {
    const { bg, text, border, shadow } = getButtonColors(theme, variant);
    return StyleSheet.create({
        button: {
            backgroundColor: disabled ? theme.colors.textMuted : bg,
            borderRadius: theme.borderRadius.m,
            borderWidth: border === 'transparent' ? 0 : 1,
            borderColor: border,
            paddingVertical: theme.spacing.s + 4,
            paddingHorizontal: theme.spacing.l,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            opacity: disabled ? 0.6 : 1,
            ...shadow,
        },
        inner: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        iconWrap: {
            marginRight: 4,
        },
        label: {
            fontSize: 15,
            fontWeight: '700',
            color: disabled ? '#fff' : text,
            letterSpacing: 0.2,
        },
    });
}
