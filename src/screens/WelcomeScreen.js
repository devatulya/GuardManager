import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const WelcomeScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
            // AuthContext handles state change -> Redirects to Main/Profile
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.bgBlobTop} />
            <View style={styles.bgBlobBottom} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.spacer} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoBox}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>Sign in to your account</Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@company.com"
                            placeholderTextColor="#9ca3af"
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
                            placeholder="Enter your password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign In</Text>}
                        {!loading && <MaterialIcons name="arrow-forward" size={20} color="white" />}
                    </Pressable>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}
                        onPress={handleGoogleLogin}
                        disabled={loading}
                    >
                        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }} style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't have an account?
                        <Text
                            style={styles.linkText}
                            onPress={() => navigation.navigate('Signup')}
                        > Sign Up</Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbfbff', // background-light
        position: 'relative',
    },
    bgBlobTop: {
        position: 'absolute',
        top: -96,
        left: -96,
        width: 256,
        height: 256,
        backgroundColor: `${theme.colors.primary}0D`, // restored to soft color
        borderRadius: 128,
        zIndex: -1,
    },
    bgBlobBottom: {
        position: 'absolute',
        bottom: -96,
        right: -96,
        width: 256,
        height: 256,
        backgroundColor: `${theme.colors.success}0D`,
        borderRadius: 128,
        zIndex: -1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    spacer: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        position: 'relative',
        overflow: 'hidden',
    },
    logoImage: {
        width: '90%',
        height: '90%',
    },
    badge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: theme.colors.success,
        padding: 4,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white',
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.indigoBold,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#49454f',
        marginTop: 6,
    },
    form: {
        width: '100%',
        gap: 32,
        marginBottom: 32,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#49454f',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        gap: 10,
        height: 56,
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#79747e',
        borderRadius: 12,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1c1b1f',
    },
    input: {
        width: '100%',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        fontSize: 16,
        color: '#111827',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginVertical: 8,
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
        height: 52,
        backgroundColor: 'white',
        borderRadius: 999,
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
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: '#2563EB', // Brighter Blue
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
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
    footer: {
        marginBottom: 32, // Minimal bottom spacing
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#6b7280',
    },
    linkText: {
        color: '#2563EB',
        fontWeight: 'bold',
    },
});

export default WelcomeScreen;
