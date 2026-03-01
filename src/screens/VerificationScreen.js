/**
 * VerificationScreen — Verify Identity via 6-digit OTP
 * Pixel-faithful match to reference design.
 * All Firebase OTP confirm logic unchanged.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { getApp } from 'firebase/app';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FirebaseRecaptchaVerifierModal from '../components/FirebaseRecaptcha';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/profile';

const BG = '#eeeef4';
const INDIGO = '#4F34E6';
const DARK = '#1a1a2e';
const GRAY = '#8888aa';
const WHITE = '#ffffff';

const S_COLOR = 'rgba(180,180,210,0.55)';
const NEU_H = 5;

/* ── countdown timer ── */
function useTimer(initial = 30) {
    const [sec, setSec] = useState(initial);
    const [active, setActive] = useState(true);
    useEffect(() => {
        if (!active || sec <= 0) { setActive(false); return; }
        const t = setTimeout(() => setSec(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [sec, active]);
    const reset = () => { setSec(initial); setActive(true); };
    const pad = n => String(n).padStart(2, '0');
    return { label: `00:${pad(sec)}`, expired: !active, reset };
}

export default function VerificationScreen({ navigation, route }) {
    const { verificationId, phoneNumber = '+910000000000', isSignup = false } = route?.params ?? {};
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const recaptchaVerifier = useRef(null);
    const app = getApp();
    const { confirmOTP, sendOTP } = useAuth();
    const timer = useTimer(30);
    const insets = useSafeAreaInsets();

    const handleChange = (text, i) => {
        if (text.length > 1) return;
        const c = [...code]; c[i] = text; setCode(c);
        if (text && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleBackspace = (text, i) => {
        if (!text && i > 0) inputRefs.current[i - 1]?.focus();
    };

    const handleVerify = async () => {
        const full = code.join('');
        if (full.length < 6) { Alert.alert('Error', 'Enter the full 6-digit code'); return; }
        setLoading(true);
        try {
            const cred = await confirmOTP(verificationId, full);
            const profile = await getProfile(cred.user.uid);
            if (!profile && !isSignup) {
                Alert.alert('Not Registered', 'No account found. Please sign up.', [
                    { text: 'OK', onPress: () => navigation.navigate('Signup') },
                ]);
                return;
            }
            navigation.replace(!profile || isSignup ? 'ProfileSetup' : 'Main');
        } catch {
            Alert.alert('Error', 'Invalid code. Please try again.');
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        if (!timer.expired) return;
        try {
            const vid = await sendOTP(phoneNumber, recaptchaVerifier.current);
            navigation.setParams({ verificationId: vid });
            timer.reset();
        } catch (e) { Alert.alert('Error', e.message); }
    };

    const displayPhone = phoneNumber.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 $3');

    return (
        <ScreenWrapper bg={BG}>
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={app.options}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[s.inner, { paddingTop: 16 }]}>

                    {/* Header */}
                    <View style={s.header}>
                        <Pressable style={s.iconPill} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="chevron-left" size={22} color={DARK} />
                        </Pressable>
                        <View style={s.shieldPill}>
                            <MaterialIcons name="security" size={22} color={INDIGO} />
                        </View>
                        <View style={{ width: 42 }} />
                    </View>

                    {/* Title */}
                    <Text style={s.title}>Verify Identity</Text>

                    {/* Subtitle */}
                    <Text style={s.subtitle}>We've sent a 6-digit verification{'\n'}code to</Text>
                    <Text style={s.phone}>{displayPhone}</Text>

                    {/* OTP boxes */}
                    <View style={s.otpRow}>
                        {code.map((d, i) => (
                            <TextInput
                                key={i}
                                ref={el => (inputRefs.current[i] = el)}
                                style={[s.otpBox, d ? s.otpBoxFilled : null]}
                                value={d}
                                onChangeText={t => handleChange(t, i)}
                                onKeyPress={({ nativeEvent }) => {
                                    if (nativeEvent.key === 'Backspace') handleBackspace(d, i);
                                }}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                selectionColor={INDIGO}
                                placeholder="·"
                                placeholderTextColor={GRAY}
                            />
                        ))}
                    </View>

                    {/* Timer pill */}
                    <Pressable style={s.timerPill} onPress={handleResend}>
                        <View style={[s.dot, timer.expired && s.dotExpired]} />
                        <Text style={s.timerText}>
                            {timer.expired ? 'Resend OTP' : `Resend in ${timer.label}`}
                        </Text>
                    </Pressable>

                    {/* Didn't get a code? */}
                    <Pressable onPress={handleResend}>
                        <Text style={s.didntGet}>DIDN'T GET A CODE?</Text>
                    </Pressable>

                    {/* Spacer */}
                    <View style={{ flex: 1 }} />

                    {/* Verify button */}
                    <Pressable
                        style={({ pressed }) => [s.verifyBtn, pressed && s.btnDown]}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color={WHITE} />
                            : <>
                                <MaterialIcons name="security" size={20} color={WHITE} style={{ marginRight: 8 }} />
                                <Text style={s.verifyBtnText}>Verify Code</Text>
                            </>
                        }
                    </Pressable>

                    {/* Bank-grade security badge */}
                    <View style={s.badge}>
                        <MaterialIcons name="check-circle" size={13} color={GRAY} />
                        <Text style={s.badgeText}>BANK-GRADE SECURITY</Text>
                    </View>

                    {/* Home bar */}
                    <View style={s.homeBar} />
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
        alignItems: 'center',
    },

    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 36,
    },
    iconPill: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BG,
        shadowColor: S_COLOR,
        shadowOffset: { width: NEU_H, height: NEU_H },
        shadowOpacity: 1,
        shadowRadius: NEU_H * 2,
        elevation: 5,
    },
    shieldPill: {
        width: 52,
        height: 52,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BG,
        // Skeuomorphic Matte Raised
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
        borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.08)',
        shadowColor: S_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Reduced spread
        shadowRadius: 8,
        elevation: 4,
    },

    /* Title & subtitle */
    title: {
        fontFamily: 'Arial',
        fontSize: 32,
        fontWeight: '800',
        color: DARK,
        letterSpacing: -0.8,
        textAlign: 'center',
        textAlign: 'center',
        marginBottom: 14,
        // Engraved text
        textShadowColor: 'rgba(255,255,255,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 0,
    },
    subtitle: {
        fontFamily: 'Arial',
        fontSize: 15,
        color: GRAY,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '700',
    },
    phone: {
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: '700',
        color: INDIGO,
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 32,
        letterSpacing: 0.4,
    },

    /* OTP boxes */
    otpRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
    },
    otpBox: {
        width: 46,
        height: 56,
        borderRadius: 16,
        fontFamily: 'Arial',
        fontSize: 22,
        fontWeight: '700',
        color: DARK,
        backgroundColor: '#f1f5f9',
        // Inset slot
        borderTopWidth: 2, borderTopColor: '#e2e8f0',
        borderBottomWidth: 0,
        borderLeftWidth: 1, borderLeftColor: '#e2e8f0',
        borderRightWidth: 1, borderRightColor: '#ffffff',
    },
    otpBoxFilled: {
        borderColor: INDIGO,
        color: INDIGO,
        backgroundColor: 'rgba(79, 52, 230, 0.04)',
    },

    /* Timer pill */
    timerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 9999,
        borderRadius: 9999,
        backgroundColor: BG,
        // Matte Pill
        borderWidth: 1, borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        marginBottom: 18,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: INDIGO,
    },
    dotExpired: {
        backgroundColor: GRAY,
    },
    timerText: {
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: '700',
        color: DARK,
    },

    /* Didn't get code */
    didntGet: {
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: '700',
        color: GRAY,
        letterSpacing: 1.2,
    },

    /* Verify button */
    verifyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 60,
        backgroundColor: INDIGO,
        borderRadius: 9999,
        marginBottom: 18,
        shadowColor: INDIGO,
        shadowOffset: { width: 0, height: 8 }, // Tighter shadow
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
        // 3D Bevel
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)',
        borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.2)',
    },
    verifyBtnText: {
        color: WHITE,
        fontFamily: 'Arial',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
        textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1,
    },
    btnDown: {
        opacity: 0.95,
        transform: [{ scale: 0.98 }, { translateY: 2 }],
        borderBottomWidth: 0,
        marginTop: 3, // Compensate for visual shift
    },

    /* Badge */
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    badgeText: {
        fontFamily: 'Arial',
        fontSize: 11,
        fontWeight: '700',
        color: GRAY,
        letterSpacing: 1.2,
    },

    /* Home bar */
    homeBar: {
        width: 100,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.12)',
        marginTop: 4,
    },
});
