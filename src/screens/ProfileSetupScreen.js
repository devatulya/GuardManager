import Text from '../components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { createProfile } from '../services/profile';
import { getTheme } from '../theme';

const theme = getTheme('light');

export default function ProfileSetupScreen({ navigation }) {
    const { user, setProfile } = useAuth();
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !city || !company) { Alert.alert('Error', 'Please fill all fields'); return; }
        setLoading(true);
        try {
            const profileData = { name, city, company, phoneNumber: user.phoneNumber, role: 'supervisor' };
            await createProfile(user.uid, profileData);
            if (setProfile) { setProfile(profileData); }
            else { navigation.navigate('Main'); }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bg={theme.colors.background}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.blobTop} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={{ width: 40 }} />
                    <Text style={styles.headerTitle}>Profile Setup</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarCard}>
                            <MaterialIcons name="photo-camera" size={40} color={theme.colors.primary} />
                            <View style={styles.editBadge}>
                                <MaterialIcons name="edit" size={14} color={theme.colors.primary} />
                            </View>
                        </View>
                        <Text style={styles.avatarTitle}>Upload Photo</Text>
                        <Text style={styles.avatarSub}>Set your professional profile picture</Text>
                    </View>

                    {/* Clay form card */}
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor={theme.colors.textMuted}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your city"
                                placeholderTextColor={theme.colors.textMuted}
                                value={city}
                                onChangeText={setCity}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Company</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Company you're working for"
                                placeholderTextColor={theme.colors.textMuted}
                                value={company}
                                onChangeText={setCompany}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Footer button */}
                <View style={styles.footer}>
                    <Pressable
                        style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.submitBtnText}>Complete Profile</Text>
                        }
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    blobTop: {
        position: 'absolute', top: -60, left: -60,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: theme.colors.primarySoft,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    scroll: { paddingHorizontal: 20, paddingBottom: 120 },
    avatarSection: { alignItems: 'center', marginBottom: 28, gap: 8 },
    avatarCard: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: theme.colors.primarySoft,
        alignItems: 'center', justifyContent: 'center',
        // Matte Raised Circle
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
        borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.08)',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    editBadge: {
        position: 'absolute', bottom: 4, right: 4,
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: theme.colors.surfaceSolid,
        alignItems: 'center', justifyContent: 'center',
        // Matte Badge
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
        borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.1)',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    avatarSub: { fontSize: 13, color: theme.colors.textSecondary },
    card: {
        backgroundColor: theme.colors.surfaceSolid,
        borderRadius: theme.borderRadius.l,
        padding: 20, gap: 18,
        // Physical Form Card
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.8)',
        borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    inputGroup: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600', color: theme.colors.text, paddingLeft: 2 },
    input: {
        height: 52,
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: 16,
        fontSize: 15, color: theme.colors.text,
        // Skeuomorphic Inset Slot
        backgroundColor: '#f1f5f9',
        borderTopWidth: 2, borderTopColor: '#e2e8f0',
        borderBottomWidth: 0,
        borderLeftWidth: 1, borderLeftColor: '#e2e8f0',
        borderRightWidth: 1, borderRightColor: '#ffffff',
    },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: theme.colors.surfaceSolid,
        borderTopWidth: 1, borderTopColor: theme.colors.borderSoft,
        padding: 16,
        ...theme.shadows.clayRaised,
    },
    submitBtn: {
        height: 54, backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center', justifyContent: 'center',
        // 3D Tactile Button
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)',
        borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.2)',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    pressed: {
        opacity: 0.95,
        transform: [{ scale: 0.98 }, { translateY: 2 }],
        borderBottomWidth: 0,
        marginTop: 3, // Visual shift
    },
    submitBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
