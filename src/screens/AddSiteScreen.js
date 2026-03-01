import Text from '../components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import DateTimePickerField from '../components/DateTimePickerField';
import ScreenWrapper from '../components/ScreenWrapper';
import { addSite, updateSiteDetails } from '../services/sites';
import { theme } from '../theme';

export default function AddSiteScreen({ navigation, route }) {
    const { site } = route.params || {};
    const isEditing = !!site;

    const [name, setName] = useState(site?.name || '');
    const [address, setAddress] = useState(site?.address || '');
    const [shiftType, setShiftType] = useState(site?.shiftType || 'Day');

    // Parse time strings back to Date
    const parseTime = (timeStr) => {
        if (!timeStr) return new Date(new Date().setHours(8, 0, 0, 0));
        const [hours, minutes] = timeStr.split(':').map(Number);
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
    };

    const [startTime, setStartTime] = useState(isEditing ? parseTime(site.defaultShiftStart) : new Date(new Date().setHours(8, 0, 0, 0)));
    const [endTime, setEndTime] = useState(isEditing ? parseTime(site.defaultShiftEnd) : new Date(new Date().setHours(20, 0, 0, 0)));
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Error', 'Site Name is required');
            return;
        }

        setLoading(true);
        try {
            const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

            const siteData = {
                name,
                address,
                shiftType,
                defaultShiftStart: formatTime(startTime),
                defaultShiftEnd: formatTime(endTime),
            };

            if (isEditing) {
                await updateSiteDetails(site.id, siteData);
                Alert.alert('Success', 'Site updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                await addSite(siteData);
                Alert.alert('Success', 'Site saved successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error(error); // Log detailed error
            Alert.alert('Error', 'Failed to save site: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Site' : 'Add New Site'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Site Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Headquarters"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 123 Main St"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <DateTimePickerField
                                label="Default Start Time"
                                value={startTime}
                                onChange={setStartTime}
                                mode="time"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <DateTimePickerField
                                label="Default End Time"
                                value={endTime}
                                onChange={setEndTime}
                                mode="time"
                            />
                        </View>
                    </View>

                    {/* Shift Type Selector */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Default Shift Mode</Text>
                        <View style={styles.segmentedControl}>
                            <Pressable
                                style={[styles.segmentButton, shiftType === 'Day' && styles.segmentButtonActive]}
                                onPress={() => setShiftType('Day')}
                            >
                                <MaterialIcons name="wb-sunny" size={20} color={shiftType === 'Day' ? theme.colors.primary : theme.colors.slate500} style={{ marginRight: 8 }} />
                                <Text style={[styles.segmentText, shiftType === 'Day' && styles.segmentTextActive]}>Day Shift</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.segmentButton, shiftType === 'Night' && styles.segmentButtonActive]}
                                onPress={() => setShiftType('Night')}
                            >
                                <MaterialIcons name="nights-stay" size={20} color={shiftType === 'Night' ? '#3b82f6' : theme.colors.slate500} style={{ marginRight: 8 }} />
                                <Text style={[styles.segmentText, shiftType === 'Night' && { color: '#3b82f6' }]}>Night Shift</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="save" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>{isEditing ? 'Update Site' : 'Save Site Details'}</Text>
                        </View>
                    )}
                </Pressable>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.slate100,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.slate900,
    },
    backButton: {
        padding: theme.spacing.s,
        marginLeft: -theme.spacing.s,
    },
    content: {
        padding: theme.spacing.m,
    },
    form: {
        gap: theme.spacing.m,
    },
    inputGroup: {
        gap: theme.spacing.s,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.slate700,
    },
    input: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.slate200,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        fontSize: 16,
        color: theme.colors.slate900,
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    halfInput: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffffCC',
        borderTopWidth: 1,
        borderTopColor: theme.colors.slate100,
        padding: theme.spacing.m,
        paddingBottom: 32,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: theme.borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonPressed: {
        transform: [{ scale: 0.98 }],
    },
    saveButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: theme.colors.slate100,
        borderRadius: theme.borderRadius.l,
        padding: 4,
        height: 56,
        marginTop: 8,
    },
    segmentButton: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentButtonActive: {
        backgroundColor: theme.colors.white,
        ...theme.shadows.clayRaised,
    },
    segmentText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.slate500,
    },
    segmentTextActive: {
        color: theme.colors.primary,
    },
});
