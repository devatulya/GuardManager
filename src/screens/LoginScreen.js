import { MaterialIcons } from '@expo/vector-icons';
import { getApp } from 'firebase/app';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FirebaseRecaptchaVerifierModal from '../components/FirebaseRecaptcha';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export default function LoginScreen({ navigation }) {
    const [phoneNumber, setPhoneNumber] = useState('+91');
    const [verificationId, setVerificationId] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { sendOTP, confirmOTP } = useAuth();

    const recaptchaVerifier = useRef(null);
    const app = getApp();

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }
        // Ensure + prefix
        const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        setLoading(true);
        try {
            const vid = await sendOTP(formattedNumber, recaptchaVerifier.current);
            setVerificationId(vid);
            Alert.alert('OTP Sent', 'Please enter the code received via SMS.');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!verificationCode) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }
        setLoading(true);
        try {
            await confirmOTP(verificationId, verificationCode);
            // Navigation handled by AuthContext persistence + MainNavigator
        } catch (error) {
            Alert.alert('Error', 'Invalid OTP Code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={app.options}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Header / Logo Area */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <View style={styles.bgBox1} />
                            <View style={styles.bgBox2} />
                            <View style={styles.logoBox}>
                                <Image
                                    source={require('../../assets/logo.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                        <View style={styles.textCenter}>
                            <Text style={styles.heading}>Guard Manager</Text>
                            <Text style={styles.subHeading}>SUPERVISOR PORTAL</Text>
                        </View>
                    </View>

                    {/* Card Container */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            {!verificationId ? 'Welcome Back' : 'Verify Identity'}
                        </Text>
                        <Text style={styles.cardSubtitle}>
                            {!verificationId
                                ? 'Enter your mobile number to sign in or create an account.'
                                : `Enter the 6-digit code sent to ${phoneNumber}`
                            }
                        </Text>

                        {/* Form */}
                        <View style={styles.form}>
                            {!verificationId ? (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Mobile Number</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="+91 99999 99999"
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                            autoComplete="tel"
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                    <Pressable
                                        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                                        onPress={handleSendOTP}
                                        disabled={loading}
                                    >
                                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Get Login Code</Text>}
                                    </Pressable>
                                </>
                            ) : (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Verification Code</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="123456"
                                            value={verificationCode}
                                            onChangeText={setVerificationCode}
                                            keyboardType="number-pad"
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                    <Pressable
                                        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                                        onPress={handleVerifyOTP}
                                        disabled={loading}
                                    >
                                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Verify & Sign In</Text>}
                                    </Pressable>
                                    <Pressable onPress={() => setVerificationId(null)} style={styles.linkButton}>
                                        <Text style={styles.linkText}>Change Phone Number</Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Footer / Powered By */}
                    <View style={styles.footer}>
                        <View style={styles.secureBadge}>
                            <MaterialIcons name="verified-user" size={14} color={theme.colors.success} />
                            <Text style={styles.secureText}>Secure & Reliable</Text>
                        </View>
                        <Text style={styles.poweredLabel}>POWERED BY SENTINEL SECURITY SYSTEMS</Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f6f8', // Matching ProfileSetup
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        width: 100,
        height: 100,
    },
    bgBox1: {
        position: 'absolute',
        width: 88,
        height: 88,
        backgroundColor: `${theme.colors.primary}10`,
        borderRadius: 24,
        transform: [{ rotate: '12deg' }],
    },
    bgBox2: {
        position: 'absolute',
        width: 88,
        height: 88,
        backgroundColor: `${theme.colors.success}10`,
        borderRadius: 24,
        transform: [{ rotate: '-6deg' }],
    },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        elevation: 2,
    },
    logoImage: {
        width: '70%',
        height: '70%',
        resizeMode: 'contain',
    },
    textCenter: {
        alignItems: 'center',
    },
    heading: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111118',
        marginBottom: 8,
    },
    subHeading: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#dbdbe6',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111118',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#616189',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4b5563',
        marginLeft: 4,
    },
    input: {
        height: 52,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#dbdbe6',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111118',
    },
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        alignItems: 'center',
        padding: 12,
    },
    linkText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
        gap: 12,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#dcfce7',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    secureText: {
        color: theme.colors.success,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    poweredLabel: {
        color: '#9ca3af',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
});
