/**
 * ScreenWrapper — Global safe area wrapper for all app screens.
 *
 * Solves: On Android devices with 3-button navigation bars (older phones),
 * content was being hidden behind the navigation bar at the bottom.
 * On newer phones with gesture navigation, the bottom inset is 0 so this
 * wrapper has no visual effect there — it only kicks in where needed.
 *
 * Usage:
 *   import ScreenWrapper from '../components/ScreenWrapper';
 *   <ScreenWrapper>...</ScreenWrapper>
 *
 *   // With custom background color:
 *   <ScreenWrapper bg="#f6f6f8">...</ScreenWrapper>
 *
 *   // For screens that manage their own bottom (e.g. WelcomeScreen with
 *   // absolute-positioned sheet), use edges prop:
 *   <ScreenWrapper edges={['top','left','right']}>...</ScreenWrapper>
 */
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScreenWrapper({
    children,
    bg = '#ffffff',
    // Which edges to apply safe area insets to.
    // Default: all four edges. Pass a custom array to skip bottom when
    // the screen manages its own bottom inset.
    edges = ['top', 'bottom', 'left', 'right'],
    style,
}) {
    const insets = useSafeAreaInsets();

    const padding = {
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
    };

    return (
        <View style={[styles.root, { backgroundColor: bg }, padding, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
});

/**
 * useBottomInset — convenience hook for screens that position content
 * absolutely at the bottom (e.g. WelcomeScreen's floating sheet).
 *
 * Returns the bottom safe area inset value + an optional extra offset.
 *
 * Usage:
 *   const bottomInset = useBottomInset();
 *   style={{ paddingBottom: bottomInset }}
 *
 *   // With extra spacing on top of the inset:
 *   const bottomInset = useBottomInset(24);
 *   style={{ paddingBottom: bottomInset }}
 */
export function useBottomInset(extraPadding = 0) {
    const insets = useSafeAreaInsets();
    return insets.bottom + extraPadding;
}
