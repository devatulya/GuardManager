import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const SignupScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signup, googleLogin } = useAuth();

    const handleSignup = async () => {
        if (!agree) {
            alert('Please agree to the Terms & Conditions.');
            return;
        }
        if (!email || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await signup(email, password);
            // AuthContext handles state -> ProfileSetup
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        if (!agree) {
            alert('Please agree to the Terms & Conditions.');
            return;
        }
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.headerSpacer} />

            {/* Header / Back Button */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={20} color="#1c1b1f" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titles}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join the Guard Manager team. Create your account to start.</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    {/* Badge */}
                    <View style={styles.badge}>
                        <MaterialIcons name="person-add" size={18} color={theme.colors.primary} />
                        <Text style={styles.badgeText}>New Registration</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>EMAIL ADDRESS</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="name@company.com"
                                placeholderTextColor="#938f99"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Create a password"
                                placeholderTextColor="#938f99"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CONFIRM PASSWORD</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                placeholderTextColor="#938f99"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        {/* Terms */}
                        <View style={styles.termsRow}>
                            <Pressable onPress={() => setAgree(!agree)} style={styles.checkbox}>
                                {agree && <MaterialIcons name="check" size={14} color={theme.colors.primary} />}
                            </Pressable>
                            <Text style={styles.termsText}>
                                I agree to the <Text style={styles.link}>Terms & Conditions</Text> and <Text style={styles.link}>Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Button */}
                    {/* Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Create Account</Text>}
                    </Pressable>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}
                        onPress={handleGoogleSignup}
                        disabled={loading}
                    >
                        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }} style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Sign  up with Google</Text>
                    </Pressable>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>ALREADY HAVE AN ACCOUNT?</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                        onPress={() => navigation.navigate('Welcome')}
                    >
                        <Text style={styles.secondaryButtonText}>Login</Text>
                    </Pressable>
                </View>

            </ScrollView>
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
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        alignItems: 'center',
    },
    titles: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111118',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#616189',
        textAlign: 'center',
        maxWidth: 240,
        lineHeight: 18,
    },
    card: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 40, // rounded-[2.5rem]
        padding: 24,
        alignItems: 'center',
        gap: 24,
        borderWidth: 1,
        borderColor: '#dbdbe6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#eff6ff', // blue-50
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    form: {
        width: '100%',
        alignItems: 'center',
        gap: 20,
    },
    inputGroup: {
        width: '100%',
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: '#616189',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    phoneInput: {
        flexDirection: 'row',
        gap: 8,
        width: 260,
    },
    countryCode: {
        height: 48,
        paddingHorizontal: 12,
        backgroundColor: '#f9fafb', // gray-50
        borderWidth: 1,
        borderColor: '#dbdbe6',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countryCodeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111118',
    },
    input: {
        width: '100%',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#dbdbe6',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 48,
        fontSize: 16,
        fontWeight: '500',
        color: '#111118',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginVertical: 12,
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '600',
    },
    googleButton: {
        width: '100%',
        height: 48,
        backgroundColor: 'white',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    googleIcon: {
        width: 20,
        height: 20,
    },
    googleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    termsRow: {
        flexDirection: 'row',
        gap: 8,
        maxWidth: 240,
        alignItems: 'flex-start',
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    termsText: {
        fontSize: 10,
        color: '#616189',
        lineHeight: 14,
        flex: 1,
    },
    link: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    button: {
        width: 260,
        height: 48,
        backgroundColor: '#2563EB', // Brighter Blue (Tailwind Blue 600)
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        width: 260,
        height: 48,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#2563EB',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#2563EB',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    buttonDisabled: {
        backgroundColor: '#cbd5e1', // slate-300
        shadowOpacity: 0,
        elevation: 0,
    },
    footerText: {
        fontSize: 12,
        color: '#616189',
        marginTop: 8,
    },
});

export default SignupScreen;
