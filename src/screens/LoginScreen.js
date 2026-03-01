import Text from '../components/Text';
/**
 * LoginScreen — Email and Password authentication
 * Pixel-faithful match to reference design (clay skeuomorphic aesthetic).
 */
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#4F34E6';
const BG = '#f6f6f8';
const DARK_TEXT = '#0a0a1f';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const insets = useSafeAreaInsets();

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please fill in both fields.');
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await googleLogin();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bg={BG}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.root}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Header: Shield Logo ── */}
                    <View style={styles.header}>
                        <View style={styles.logoOuter}>
                            <View style={styles.logoInner}>
                                <MaterialIcons name="security" size={40} color="white" />
                            </View>
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>Supervisor Login</Text>
                        </View>
                    </View>

                    {/* ── Form ── */}
                    <View style={styles.form}>
                        {/* Email */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>WORK EMAIL</Text>
                            <View style={styles.inputRow}>
                                <MaterialIcons name="email" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter work email"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <View style={styles.inputRow}>
                                <MaterialIcons name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter password"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        {/* Forgot Password Link */}
                        <View style={styles.forgotPasswordContainer}>
                            <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </Pressable>
                        </View>

                        {/* Primary Login button */}
                        <Pressable
                            style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : <Text style={styles.primaryBtnText}>Login  →</Text>
                            }
                        </Pressable>

                        {/* OR Separator */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google button */}
                        <Pressable
                            style={({ pressed }) => [styles.googleBtn, pressed && styles.btnPressed]}
                            onPress={handleGoogleLogin}
                            disabled={loading}
                        >
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }}
                                style={styles.googleIcon}
                            />
                            <Text style={styles.googleBtnText}>Login with Google</Text>
                        </Pressable>
                    </View>

                    {/* ── Footer ── */}
                    <View style={styles.footer}>
                        <Pressable
                            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.secondaryBtnText}>
                                New to GuardManager?{' '}
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </Text>
                        </Pressable>
                        <View style={styles.homeIndicator} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 32,
        paddingTop: 16,
        paddingBottom: 32,
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: 32,
        gap: 12,
    },
    logoOuter: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: 'white',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 10,
    },
    logoInner: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: PRIMARY,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: PRIMARY,
        shadowOffset: { width: 12, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
    },
    title: {
        fontFamily: 'Arial',
        fontSize: 30,
        fontWeight: '800',
        color: DARK_TEXT,
        letterSpacing: -0.5,
    },
    pill: {
        backgroundColor: 'white',
        paddingHorizontal: 16, paddingVertical: 6,
        borderRadius: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    pillText: {
        color: PRIMARY,
        fontFamily: 'Arial',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    // Form
    form: { gap: 20 },
    fieldGroup: { gap: 8 },
    label: {
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        paddingLeft: 4,
    },
    inputRow: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f1f5f9',
        borderTopWidth: 2, borderTopColor: '#e2e8f0',
        borderBottomWidth: 0,
        borderLeftWidth: 1, borderLeftColor: '#e2e8f0',
        borderRightWidth: 1, borderRightColor: '#ffffff',
    },
    inputIcon: { marginRight: 12 },
    textInput: {
        flex: 1,
        fontFamily: 'Arial',
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '700',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginTop: -8,
        paddingRight: 4,
    },
    forgotPasswordText: {
        color: PRIMARY,
        fontFamily: 'Arial',
        fontWeight: '700',
        fontSize: 13,
    },

    // Buttons
    primaryBtn: {
        height: 64,
        backgroundColor: PRIMARY,
        borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        marginTop: 4,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)',
        borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.2)',
    },
    primaryBtnText: {
        color: 'white', fontSize: 17, fontWeight: '800',
        textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1,
    },
    btnPressed: {
        opacity: 0.95,
        transform: [{ scale: 0.98 }, { translateY: 2 }],
        borderBottomWidth: 0,
        marginTop: 7,
    },

    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
    dividerText: {
        fontFamily: 'Arial',
        fontSize: 11, fontWeight: '800', color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: 2,
    },

    googleBtn: {
        height: 56,
        backgroundColor: 'white',
        borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 12,
        borderWidth: 1, borderColor: '#e2e8f0',
        borderBottomWidth: 3, borderBottomColor: '#cbd5e1',
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    googleIcon: { width: 24, height: 24 },
    googleBtnText: { fontFamily: 'Arial', fontSize: 15, fontWeight: '700', color: DARK_TEXT },

    // Footer
    footer: { marginTop: 24, alignItems: 'center', gap: 16 },
    secondaryBtn: {
        width: '100%',
        height: 56,
        backgroundColor: '#eef1f6',
        borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: '#a0aec0',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.20,
        shadowRadius: 12,
        elevation: 3,
    },
    secondaryBtnText: { fontFamily: 'Arial', fontSize: 14, fontWeight: '700', color: '#475569' },
    signupLink: { color: PRIMARY, textDecorationLine: 'underline' },
    homeIndicator: {
        width: 128, height: 6,
        borderRadius: 3, backgroundColor: '#cbd5e1',
        opacity: 0.5, marginTop: 4,
    },
});
