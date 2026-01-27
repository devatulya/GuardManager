import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export default function SettingsScreen() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            Alert.alert('Error', e.message);
        }
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
                        <MaterialIcons name="notifications" size={24} color={theme.colors.slate500} />
                        <Text style={styles.rowText}>Notifications</Text>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.slate400} />
                    </Pressable>
                    <Pressable style={styles.row}>
                        <MaterialIcons name="language" size={24} color={theme.colors.slate500} />
                        <Text style={styles.rowText}>Language</Text>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.slate400} />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.slate200,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.slate900,
    },
    content: {
        padding: theme.spacing.m,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.l,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
        color: theme.colors.slate900,
    },
    profileEmail: {
        fontSize: 14,
        color: theme.colors.slate500,
        marginBottom: 8,
    },
    editProfileButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: theme.colors.slate100,
    },
    editProfileText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.slate700,
    },
    section: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.m, // p-4
        marginBottom: theme.spacing.l,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.slate500,
        marginBottom: theme.spacing.m,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.slate100,
    },
    rowText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.slate900,
        marginLeft: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2', // red-100
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
        color: theme.colors.slate400,
        fontSize: 12,
    },
});
