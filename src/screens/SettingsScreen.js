import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const { theme, setThemeMode, themeMode } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    };

    const toggleTheme = () => {
        Alert.alert(
            'Select Theme',
            `Current: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`,
            [
                { text: 'Light', onPress: () => setThemeMode('light') },
                { text: 'Dark', onPress: () => setThemeMode('dark') },
                { text: 'System Default', onPress: () => setThemeMode('system') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>Supervisor</Text>
                        <Text style={styles.profileEmail}>{user?.email}</Text>
                        <Pressable style={styles.editProfileButton}>
                            <Text style={styles.editProfileText}>Edit Profile</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Preferences</Text>
                    <Pressable style={styles.row}>
                        <MaterialIcons name="notifications" size={24} color={theme.colors.textSecondary} />
                        <Text style={styles.rowText}>Notifications</Text>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                    </Pressable>
                    <Pressable style={styles.row} onPress={toggleTheme}>
                        <MaterialIcons name="brightness-6" size={24} color={theme.colors.textSecondary} />
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.rowText}>Theme</Text>
                            <Text style={styles.valueText}>{themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                    </Pressable>
                    <Pressable style={styles.row}>
                        <MaterialIcons name="language" size={24} color={theme.colors.textSecondary} />
                        <Text style={styles.rowText}>Language</Text>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                    </Pressable>
                </View>

                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color={theme.colors.danger} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>

                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.headerBackground,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    content: {
        padding: theme.spacing.m,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.l,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    profileEmail: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    editProfileButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: theme.colors.backgroundLight,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    editProfileText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text,
    },
    section: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    rowText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
        marginLeft: 12,
    },
    valueText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginRight: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${theme.colors.danger}1A`, // Light red
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing.l,
    },
    logoutText: {
        color: theme.colors.danger,
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    version: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
});
