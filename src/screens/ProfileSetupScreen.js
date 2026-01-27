import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createProfile } from '../services/profile';
import { theme } from '../theme';

export default function ProfileSetupScreen({ navigation }) {
    const { user, setProfile } = useAuth();
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !city || !company) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const profileData = {
                name,
                city,
                company,
                phoneNumber: user.phoneNumber,
                role: 'supervisor'
            };

            await createProfile(user.uid, profileData);

            // Update Context State to trigger AppNavigator switch
            if (setProfile) {
                setProfile(profileData);
            } else {
                // Fallback if context doesn't have it (shouldn't happen with latest update)
                navigation.navigate('Main');
            }

        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={20} color="#111118" />
                </Pressable>
                <Text style={styles.headerTitle}>Profile Setup</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* White Card */}
                <View style={styles.card}>
                    {/* Photo Upload */}
                    <View style={styles.photoContainer}>
                        <View style={styles.photoWrapper}>
                            <View style={styles.photoPlaceholder}>
                                <MaterialIcons name="photo-camera" size={48} color="white" />
                            </View>
                            <View style={styles.editBadge}>
                                <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
                            </View>
                        </View>
                        <Text style={styles.photoTitle}>Upload Photo</Text>
                        <Text style={styles.photoSubtitle}>Set your professional profile picture</Text>
                    </View>

                    {/* Inputs */}
                    <View style={styles.form}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#616189"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* City */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your city"
                                placeholderTextColor="#616189"
                                value={city}
                                onChangeText={setCity}
                            />
                        </View>

                        {/* Company */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Company</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Company you're working for"
                                placeholderTextColor="#616189"
                                value={company}
                                onChangeText={setCompany}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Complete Profile</Text>
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 56 : 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0, // Hidden but keeps layout
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111118',
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        gap: 24,
        borderWidth: 1,
        borderColor: '#dbdbe6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    photoContainer: {
        alignItems: 'center',
        gap: 16,
    },
    photoWrapper: {
        position: 'relative',
    },
    photoPlaceholder: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    editBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f9fafb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    photoTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111118',
        marginBottom: -4,
    },
    photoSubtitle: {
        fontSize: 14,
        color: '#616189',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111118',
        paddingLeft: 4,
    },
    input: {
        height: 56,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#dbdbe6',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111118',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f6f6f8',
        borderTopWidth: 1,
        borderTopColor: '#dbdbe6',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
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
    },
});
