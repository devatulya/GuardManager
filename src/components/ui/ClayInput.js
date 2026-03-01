import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * ClayInput — styled TextInput with clay inset shadow
 *
 * Props:
 *   label      — field label text
 *   error      — error message string
 *   leftIcon   — React element for left icon slot
 *   rightIcon  — React element for right icon slot
 *   theme      — optional override
 *   + all standard TextInput props
 */
export default function ClayInput({
    label,
    error,
    leftIcon,
    rightIcon,
    theme: themeProp,
    style,
    ...textInputProps
}) {
    const { theme: ctxTheme } = useTheme();
    const theme = themeProp || ctxTheme;
    const [focused, setFocused] = useState(false);
    const styles = getStyles(theme, focused, !!error);

    return (
        <View style={[styles.wrapper, style]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View style={styles.inputRow}>
                {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
                <TextInput
                    style={[styles.input, leftIcon && styles.inputWithLeft, rightIcon && styles.inputWithRight]}
                    placeholderTextColor={theme.colors.textMuted}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...textInputProps}
                />
                {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

function getStyles(theme, focused, hasError) {
    const borderColor = hasError
        ? theme.colors.danger
        : focused
            ? theme.colors.primary
            : theme.colors.borderHard;

    return StyleSheet.create({
        wrapper: {
            marginBottom: theme.spacing.s,
        },
        label: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.textSecondary,
            marginBottom: 6,
        },
        inputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceSolid,
            borderRadius: theme.borderRadius.m,
            borderWidth: focused ? 1.5 : 1,
            borderColor,
            // Clay inset shadow
            ...theme.shadows.clayInset,
        },
        input: {
            flex: 1,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s + 4,
            fontSize: 15,
            color: theme.colors.text,
        },
        inputWithLeft: {
            paddingLeft: theme.spacing.xs,
        },
        inputWithRight: {
            paddingRight: theme.spacing.xs,
        },
        iconLeft: {
            paddingLeft: theme.spacing.m,
        },
        iconRight: {
            paddingRight: theme.spacing.m,
        },
        error: {
            fontSize: 12,
            color: theme.colors.danger,
            marginTop: 4,
        },
    });
}
