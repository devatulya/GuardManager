import Text from '../components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import { getTheme } from '../theme';

const { width } = Dimensions.get('window');
const theme = getTheme('light');

const SplashScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]).start();

        const timer = setTimeout(() => navigation.replace('Welcome'), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <ScreenWrapper bg={theme.colors.background}>
            <View style={styles.container}>
                {/* Background glow blobs */}
                <View style={styles.blobTop} />
                <View style={styles.blobBottom} />

                <Animated.View style={[styles.center, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    {/* Logo clay card */}
                    <View style={styles.logoCard}>
                        <View style={styles.logoGlow} />
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.appName}>
                        Guard<Text style={styles.appNameAccent}>Manager</Text>
                    </Text>
                    <Text style={styles.tagline}>SUPERVISOR PORTAL</Text>
                </Animated.View>

                <View style={styles.footer}>
                    <View style={styles.secureBadge}>
                        <MaterialIcons name="verified-user" size={13} color={theme.colors.primary} />
                        <Text style={styles.secureText}>Secure & Reliable</Text>
                    </View>
                    <Text style={styles.credit}>Developed by Atulya Sahu</Text>
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    blobTop: {
        position: 'absolute',
        top: -80,
        left: -80,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: theme.colors.primarySoft,
    },
    blobBottom: {
        position: 'absolute',
        bottom: -80,
        right: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(34,197,94,0.08)',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    logoCard: {
        width: 120,
        height: 120,
        borderRadius: theme.borderRadius.l,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        // Physical Card
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.8)',
        borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.08)',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 8,
    },
    logoGlow: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primarySoft,
        // Inset Glow
        borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)',
    },
    logoImage: {
        width: 80,
        height: 80,
    },
    appName: {
        fontSize: 36,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(255,255,255,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 0,
    },
    appNameAccent: {
        color: theme.colors.primary,
    },
    tagline: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        letterSpacing: 3,
    },
    footer: {
        alignItems: 'center',
        gap: 10,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        gap: 6,
        backgroundColor: theme.colors.primarySoft,
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: theme.borderRadius.pill,
        // Matte Pill
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
        borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    secureText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    credit: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontWeight: '500',
    },
});

export default SplashScreen;
