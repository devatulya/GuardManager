import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        // Auto navigate to Auth flow after 2 seconds
        const timer = setTimeout(() => {
            navigation.replace('Welcome');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.topSpacer} />

            <View style={styles.centerContent}>
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

                <View style={styles.textContainer}>
                    <Text style={styles.paramsText}>
                        Guard <Text style={styles.highlight}>Manager</Text>
                    </Text>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.subText}>SUPERVISOR PORTAL</Text>
                        <View style={styles.divider} />
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.secureBadge}>
                    <MaterialIcons name="verified-user" size={14} color={theme.colors.secondary} />
                    <Text style={styles.secureText}>Secure & Reliable</Text>
                </View>
                <View style={styles.poweredBy}>
                    <Text style={styles.poweredLabel}>DEVELOPED BY</Text>
                    <Text style={styles.poweredCompany}>Atulya Sahu</Text>
                </View>
                <View style={styles.bottomBar} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 56,
    },
    topSpacer: {
        height: 48,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
        width: 140,
        height: 140,
    },
    bgBox1: {
        position: 'absolute',
        width: 128,
        height: 128,
        backgroundColor: `${theme.colors.primary}0D`,
        borderRadius: 32,
        transform: [{ rotate: '12deg' }],
    },
    bgBox2: {
        position: 'absolute',
        width: 128,
        height: 128,
        backgroundColor: `${theme.colors.secondary}0D`,
        borderRadius: 32,
        transform: [{ rotate: '-6deg' }],
    },
    logoBox: {
        width: 112,
        height: 112,
        backgroundColor: 'white',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f9fafb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    logoImage: {
        width: '80%',
        height: '80%',
    },
    textContainer: {
        alignItems: 'center',
    },
    paramsText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1c1b1f',
        letterSpacing: -0.5,
    },
    highlight: {
        color: theme.colors.primary,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    divider: {
        height: 1,
        width: 16,
        backgroundColor: `${theme.colors.primary}33`,
    },
    subText: {
        color: theme.colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    footer: {
        alignItems: 'center',
        gap: 16,
        paddingBottom: 8,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: `${theme.colors.secondary}1A`,
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 999,
    },
    secureText: {
        color: theme.colors.secondary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    poweredBy: {
        alignItems: 'center',
        gap: 2,
    },
    poweredLabel: {
        color: '#9ca3af',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    poweredCompany: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '800',
    },
    bottomBar: {
        width: 144,
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 999,
        position: 'absolute',
        bottom: 0,
    },
});

export default SplashScreen;
