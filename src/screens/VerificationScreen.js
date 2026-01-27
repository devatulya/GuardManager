import { MaterialIcons } from '@expo/vector-icons';
import { getApp } from 'firebase/app';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import FirebaseRecaptchaVerifierModal from '../components/FirebaseRecaptcha';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/profile';
import { theme } from '../theme';

const VerificationScreen = ({ navigation, route }) => {
    const { phoneNumber } = route.params || { phoneNumber: '+919999999999' };
    const [code, setCode] = useState(['', '', '', '', '', '']); // 6 digits for Firebase
    const inputRefs = useRef([]);
    const [loading, setLoading] = useState(false);
    const [verificationId, setVerificationId] = useState(null);
    const { sendOTP, confirmOTP, logout } = useAuth();
    const recaptchaVerifier = useRef(null);
    const app = getApp();

    // Auto-send OTP on mount
    useEffect(() => {
        sendVerificationCode();
    }, []);

    const sendVerificationCode = async () => {
        setLoading(true);
        try {
            const vid = await sendOTP(phoneNumber, recaptchaVerifier.current);
            setVerificationId(vid);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length < 6) {
            Alert.alert('Error', 'Please enter the full 6-digit code');
            return;
        }

        setLoading(true);
        try {
            // confirmOTP returns the UserCredential internally
            const userCredential = await confirmOTP(verificationId, fullCode);
            const user = userCredential.user;

            // Check if profile exists
            const profile = await getProfile(user.uid);
            const isSignup = route.params?.isSignup ?? false;

            if (!profile && !isSignup) {
                // User logged in via "Welcome" (Login) but has no profile.
                // Enforce "Signup First"
                Alert.alert('Account Not Found', 'This number is not registered. Please create an account.', [
                    { text: 'OK', onPress: () => navigation.navigate('Signup') }
                ]);
                await logout();
            } else if (profile && isSignup) {
                // User tried to Signup but already exists
                Alert.alert('Account Exists', 'This number is already registered. Please login.', [
                    { text: 'OK', onPress: () => navigation.navigate('Welcome') }
                ]);
                // We let them stay logged in, AppNavigator will redirect to Main ideally.
            }

            // If profile exists and !isSignup (Normal Login) -> AppNavigator handles it.
            // If !profile and isSignup (Normal Signup) -> AppNavigator handles it (ProfileSetup).

        } catch (error) {
            Alert.alert('Error', 'Invalid OTP or Verification Failed');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (text, index) => {
        if (text.length > 1) {
            return;
        }

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (text, index) => {
        if (!text && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={app.options}
            />

            <View style={styles.headerSpacer} />
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={20} color="#111118" />
                </Pressable>
            </View>

            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Verify Number</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to <Text style={styles.phone}>{phoneNumber}</Text>
                    </Text>
                </View>

                {/* OTP Input */}
                <View style={styles.otpContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            style={[styles.otpInput, digit && styles.otpInputFilled]}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace') {
                                    handleBackspace(digit, index);
                                }
                            }}
                            keyboardType="number-pad"
                            maxLength={1}
                            ref={(ref) => inputRefs.current[index] = ref}
                        />
                    ))}
                </View>

                {/* Resend */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive the code? <Text style={styles.resendTimer}>Resend in 24s</Text></Text>
                    <Pressable onPress={sendVerificationCode} disabled={loading}>
                        <Text style={[styles.resendAction, loading && { opacity: 0.5 }]}>Resend OTP</Text>
                    </Pressable>
                </View>
            </View>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Verify & Continue</Text>
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f8',
    },
    headerSpacer: {
        height: Platform.OS === 'ios' ? 40 : 20,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 24,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
        gap: 8,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#111118',
    },
    subtitle: {
        fontSize: 16,
        color: '#616189',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 280,
    },
    phone: {
        color: '#111118',
        fontWeight: '500',
    },
    otpContainer: {
        flexDirection: 'row',
        gap: 8, // Tighter gap for 6 digits
        marginBottom: 40,
        justifyContent: 'center',
        width: '100%',
    },
    otpInput: {
        width: 48,
        height: 56,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#dbdbe6',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#111118',
    },
    otpInputFilled: {
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}05`, // subtle tint
    },
    resendContainer: {
        alignItems: 'center',
        gap: 12,
    },
    resendText: {
        fontSize: 14,
        color: '#616189',
    },
    resendTimer: {
        color: '#111118',
        fontWeight: '600',
    },
    resendAction: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
        opacity: 0.5,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        backgroundColor: 'transparent',
    },
    button: {
        height: 56,
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default VerificationScreen;
