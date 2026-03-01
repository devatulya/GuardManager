/**
 * WelcomeScreen — Pixel-precise match to Stitch "GuardManager Welcome Onboarding"
 *
 * Spec:
 *  • Diagonal gradient: deep violet #3211d4 (top-left) → blue-purple #7c3aed (bottom-right)
 *  • Header: white circle icon + "GuardManager" brand text
 *  • Illustration: 3D guard INSIDE a teal-bg rounded card, with generous inner padding
 *  • White floating bottom sheet: large rounded top corners (36px)
 *  • Handle pill → Title (bold) → Subtitle (light) → Pill CTA → Ghost Sign In
 */
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Dimensions,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomInset } from '../components/ScreenWrapper';

const { height: H, width: W } = Dimensions.get('window');

const VIOLET = '#3211D4';
const BPURPLE = '#7C3AED';
const SLATE900 = '#0f172a';
const SLATE500 = '#64748b';

// Stitch-hosted 3D clay guard illustration
const HERO_URI =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCbUOzIGk-MFoqhp4VGNjFxrLS-NfTlweJHKa8_vGj2s0mzt_efGw0cz37O0LACsgF1wpnCvJitECWrRNdGPylw0vbsdjQ89DHpHrsTNjl6KJvoeP6rIXJSIX5IsDWN4YtukqvzIH15woeQDEbi3gZGmbtNidF-RLpxl_F8aPnOtqnmNzmwn3tL0-tQzZ_fVXiOiiEvzdMp1VygToz-YWMkQeuTwSNOPc3xyeq-NgxAPPhjORGCCjDUjSi04pTL8l8zIU_XELDx0TU';

/* ─────────────────────────── Layout constants ────────────────────────── */
const SHEET_H = H * 0.44;   // white sheet height
const CARD_W = W * 0.74;   // illustration card width
const CARD_H = CARD_W;     // square card
const CARD_PAD = 14;         // inner padding so image doesn't touch edges

export default function WelcomeScreen({ navigation }) {
    const bottomInset = useBottomInset();
    const insets = useSafeAreaInsets();
    return (
        <View style={s.root}>

            {/* ── Diagonal gradient (covers entire screen) ── */}
            <LinearGradient
                colors={[VIOLET, BPURPLE]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* ── Ambient glow circles (very subtle) ── */}
            <View style={s.glowTL} />
            <View style={s.glowBR} />

            {/* ══════════════════════════════════════════
                HEADER  ─  logo circle + brand name
            ══════════════════════════════════════════ */}
            <View style={[s.header, { top: insets.top + (Platform.OS === 'ios' ? 10 : 8) }]}>
                <View style={s.logoCircle}>
                    <MaterialIcons name="security" size={17} color={VIOLET} />
                </View>
                <Text style={s.brandName}>GuardManager</Text>
            </View>

            {/* ══════════════════════════════════════════
                ILLUSTRATION CARD
                — soft teal background, generous padding,
                  image framed inside, never touching edges
            ══════════════════════════════════════════ */}
            <View style={[s.cardWrap, { paddingTop: insets.top + (Platform.OS === 'ios' ? 24 : 18) }]}>
                {/* Outer rounded card — teal bg */}
                <View style={s.illustCard}>
                    {/* Inner padding frame so guard doesn't touch card edges */}
                    <View style={s.illustInner}>
                        <Image
                            source={{ uri: HERO_URI }}
                            style={s.illustImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </View>

            {/* ══════════════════════════════════════════
                WHITE FLOATING BOTTOM SHEET
            ══════════════════════════════════════════ */}
            <View style={[s.sheet, { paddingBottom: bottomInset + 16 }]}>

                {/* Drag handle pill */}
                <View style={s.handle} />

                {/* Title */}
                <Text style={s.title}>Welcome to{'\n'}GuardManager</Text>

                {/* Subtitle */}
                <Text style={s.subtitle}>
                    Manage your guards, sites and{'\n'}attendance in one place.
                </Text>

                {/* ── Primary pill CTA ── */}
                <Pressable
                    style={({ pressed }) => [s.cta, pressed && s.ctaDown]}
                    onPress={() => navigation.navigate('Signup')}
                >
                    <Text style={s.ctaLabel}>Get Started</Text>
                    <Text style={s.ctaArrow}>  →</Text>
                </Pressable>

                {/* ── Ghost secondary ── */}
                <Pressable
                    style={({ pressed }) => [s.ghost, pressed && s.ghostDown]}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={s.ghostLabel}>Sign In</Text>
                </Pressable>

            </View>
        </View>
    );
}

/* ─────────────────────────── Styles ────────────────────────────────── */
const s = StyleSheet.create({

    root: { flex: 1, backgroundColor: VIOLET },

    /* Ambient blob glows */
    glowTL: {
        position: 'absolute',
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.07)',
        top: -90, left: -90,
    },
    glowBR: {
        position: 'absolute',
        width: 240, height: 240, borderRadius: 120,
        backgroundColor: 'rgba(167,139,250,0.11)',
        /* sits just above the sheet */
        bottom: SHEET_H - 20, right: -70,
    },

    /* ── Header ── */
    header: {
        position: 'absolute',
        left: 22,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        zIndex: 10,
    },
    logoCircle: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.93)',
        alignItems: 'center', justifyContent: 'center',
    },
    brandName: {
        color: '#fff',
        fontFamily: 'Arial',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.1,
    },

    /* ── Illustration card wrapper — centred in gradient zone ── */
    cardWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: SHEET_H,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Rounded card with soft teal background */
    illustCard: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: 26,
        backgroundColor: '#b2e0e8',   // soft teal — matches Stitch reference
        padding: CARD_PAD,
        /* Lifted card shadow */
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.20,
        shadowRadius: 28,
        elevation: 14,
        overflow: 'hidden',
    },

    /* Inner frame ensures image never touches card rounded edges */
    illustInner: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustImage: {
        width: '100%',
        height: '100%',
    },

    /* ── White floating sheet ── */
    sheet: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: SHEET_H,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        alignItems: 'center',
        paddingTop: 12,
        paddingHorizontal: 28,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
        shadowColor: '#1e1b4b',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.15, // Increased for stronger depth
        shadowRadius: 20,
        elevation: 24,
        borderTopWidth: 1, // Highlight edge
        borderTopColor: 'rgba(255,255,255,0.8)',
    },

    handle: {
        width: 38, height: 5,
        borderRadius: 3,
        backgroundColor: '#d1d5db',
        marginBottom: 20,
    },

    // ── Title ── bold but friendly, geometric, dominant
    title: {
        fontFamily: 'Arial',
        fontSize: 30,
        fontWeight: '700',          // semibold-to-bold: confident, not harsh
        color: '#1e293b',           // deep slate — warmer than pure black
        textAlign: 'center',
        letterSpacing: -0.6,        // slightly negative — tightens headline visually
        lineHeight: 42,             // loose/comfortable, not cramped
        marginBottom: 12,
        // Skeuomorphic engrave
        textShadowColor: 'rgba(255,255,255,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 0,
    },

    // ── Subtitle ── regular, clearly secondary, informative
    subtitle: {
        fontFamily: 'Arial',
        fontSize: 15,
        fontWeight: '700',          // regular — never competes with title
        color: '#94a3b8',           // muted slate — clearly secondary
        textAlign: 'center',
        lineHeight: 24,             // relaxed and readable
        letterSpacing: 0.1,         // neutral/very slightly positive
        maxWidth: 260,              // keeps line length comfortable
    },

    // ── Primary Pill CTA ── heavy, elevated, inviting, physically pressable
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 60,                 // tall → touch-friendly, dominant
        backgroundColor: VIOLET,    // deep saturated purple/indigo
        borderRadius: 9999,         // maximum pill — no compromise
        marginTop: 'auto',
        marginBottom: 2,
        paddingHorizontal: 32,      // generous horizontal breathing room
        // Skeuomorphic 3D Button
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)', // Top reflection
        borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.2)', // Bottom shadow/thickness

        // Layered glow: diffused primary shadow + ambient lift
        shadowColor: VIOLET,     // deep violet glow color
        shadowOffset: { width: 0, height: 8 }, // Slightly tighter, punchier shadow
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
    },
    ctaLabel: {
        color: '#ffffff',
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: '700',          // semibold — clear, not too bold
        letterSpacing: 0.4,         // slightly open for clarity on white text
    },
    ctaArrow: {
        color: '#ffffff',
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 6,              // balanced spacing between text and arrow
    },
    ctaDown: {
        opacity: 0.95,
        transform: [{ scale: 0.98 }, { translateY: 2 }], // Physically press down
        shadowOffset: { width: 0, height: 2 }, // Collapse shadow
        shadowRadius: 4,
        elevation: 4,
        borderBottomWidth: 0, // Reduces thickness visual
        marginTop: 'auto', // Keep layout consistent (marginTop is 'auto' in cta, this style merges)
    },

    // ── Sign In ghost ── minimal, optional, clearly secondary
    ghost: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,               // comfortable gap below CTA
    },
    ghostLabel: {
        color: '#7c5ce9',           // same purple family but lighter, less dominant
        fontFamily: 'Arial',
        fontSize: 14,               // small — not competing
        fontWeight: '700',          // medium — readable but not dominant
        letterSpacing: 0.1,
    },
    ghostDown: {
        opacity: 0.6,
        transform: [{ scale: 0.98 }],
    },
});
