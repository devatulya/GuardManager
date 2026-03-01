import { Text as RNText, StyleSheet } from 'react-native';

export default function Text({ style, ...props }) {
    const flattenedStyle = StyleSheet.flatten(style) || {};
    const weight = String(flattenedStyle.fontWeight || '400');
    let fontFamily = 'Poppins_400Regular';

    if (weight === 'bold' || weight >= '700') fontFamily = 'Poppins_700Bold';
    else if (weight === '500') fontFamily = 'Poppins_500Medium';
    else if (weight === '600') fontFamily = 'Poppins_600SemiBold';
    else if (weight === '800') fontFamily = 'Poppins_800ExtraBold';

    // Remove fontWeight from style to avoid conflict with custom font weight
    const { fontWeight, ...restStyle } = flattenedStyle;

    return (
        <RNText style={[{ fontFamily }, restStyle]} {...props} />
    );
}
