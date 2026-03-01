import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#4F34E6';
const BG = '#f6f6f8';
const DARK_TEXT = '#0a0a1f';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();
    const insets = useSafeAreaInsets();

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your work email.');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(email);
            Alert.alert(
                'Link Sent',
                'If an account exists with this email, a reset link has been sent.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Error', error.message);
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
                    {/* Header: Shield Logo */}
                    <View style={styles.header}>
                        <View style={styles.logoOuter}>
                            <View style={styles.logoInner}>
                                <MaterialIcons name="lock-reset" size={40} color="white" />
                            </View>
                        </View>
                        <Text style={styles.title}>Reset Password</Text>
                        {/* Pill badge */}
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>Recover Access</Text>
                        </View>
                    </View>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Text>

                    {/* Form */}
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

                        {/* Primary Button */}
                        <Pressable
                            style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                            onPress={handleReset}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                            }
                        </Pressable>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        {/* Secondary Return button */}
                        <Pressable
                            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.secondaryBtnText}>
                                Remembered?{' '}
                                <Text style={styles.loginLink}>Back to Login</Text>
                            </Text>
                        </Pressable>
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
    header: {
        alignItems: 'center',
        marginBottom: 24,
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
    subtitle: {
        fontFamily: 'Arial',
        fontSize: 15,
        color: '#64748b',
        lineHeight: 23,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    form: { gap: 24 },
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
    footer: { marginTop: 48, alignItems: 'center', gap: 16 },
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
    loginLink: { color: PRIMARY, textDecorationLine: 'underline' },
});
