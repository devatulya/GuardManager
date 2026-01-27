import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerField from '../components/DateTimePickerField';
import SearchablePicker from '../components/SearchablePicker';
import { addGuard, updateGuardDetails } from '../services/guards';
import { getSites } from '../services/sites';
import { theme } from '../theme';
// In a real app we might use a Dropdown package, but for now we'll simulate or use basic picker
// Since Expo supports Picker via @react-native-picker/picker, I should have installed it.
// Plan said "No TypeScript (keep simple)". "No unnecessary abstractions."
// If I didn't install picker, I can use a simple modal or just a text input for Site ID (user manually enters or selects from list in a modal).
// Or actually, simple "Select Site" button that shows an Alert with options if list is small, or just a separate selection screen.
// I'll assume for simplicity logic (or if I missed installing picker) that I can implement a basic modal selector.

import { FlatList, Modal } from 'react-native';

const SitePicker = ({ selectedSiteId, onSelect, sites }) => {
    const [visible, setVisible] = useState(false);
    const selectedSite = sites.find(s => s.id === selectedSiteId);

    return (
        <>
            <Pressable onPress={() => setVisible(true)} style={styles.pickerButton}>
                <Text style={selectedSite ? styles.pickerText : styles.pickerPlaceholder}>
                    {selectedSite ? selectedSite.name : 'Select a site'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.slate500} />
            </Pressable>
            <Modal visible={visible} animationType="slide">
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Site</Text>
                        <Pressable onPress={() => setVisible(false)}><MaterialIcons name="close" size={24} /></Pressable>
                    </View>
                    <FlatList
                        data={sites}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <Pressable style={styles.modalItem} onPress={() => { onSelect(item.id, item.name); setVisible(false); }}>
                                <Text style={styles.modalItemText}>{item.name}</Text>
                            </Pressable>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        </>
    );
};

export default function AddGuardScreen({ navigation, route }) {
    const { guard } = route.params || {};
    const isEditing = !!guard;

    const [name, setName] = useState(guard?.name || '');
    const [phone, setPhone] = useState(guard?.phone || '');
    const [siteId, setSiteId] = useState(guard?.defaultSiteId || null);
    const [siteName, setSiteName] = useState(guard?.defaultSiteName || '');

    // Parse time strings back to Date objects for picker
    const parseTime = (timeStr) => {
        if (!timeStr) return new Date(new Date().setHours(8, 0, 0, 0));
        const [hours, minutes] = timeStr.split(':').map(Number);
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
    };

    const [startTime, setStartTime] = useState(isEditing ? parseTime(guard.defaultStartTime) : new Date(new Date().setHours(8, 0, 0, 0)));
    const [endTime, setEndTime] = useState(isEditing ? parseTime(guard.defaultEndTime) : new Date(new Date().setHours(17, 0, 0, 0)));
    const [salary, setSalary] = useState(guard?.monthlySalary ? String(guard.monthlySalary) : '');
    const [active, setActive] = useState(guard ? guard.active : true);

    const [loading, setLoading] = useState(false);
    const [sites, setSites] = useState([]);

    useEffect(() => {
        getSites().then(setSites).catch(console.error);
    }, []);

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Error', 'Full Name is required');
            return;
        }

        // Format times
        const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        setLoading(true);
        try {
            const guardData = {
                name,
                phone,
                defaultSiteId: siteId,
                defaultSiteName: siteName,
                defaultStartTime: formatTime(startTime),
                defaultEndTime: formatTime(endTime),
                monthlySalary: parseFloat(salary) || 0,
                active,
            };

            if (isEditing) {
                await updateGuardDetails(guard.id, guardData);
                Alert.alert('Success', 'Guard updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                await addGuard(guardData);
                Alert.alert('Success', 'Guard saved successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save guard: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Guard' : 'Add New Guard'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    <Text style={styles.sectionSubtitle}>Enter the guard's official identity information.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. John Doe"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+1 (555) 000-0000"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Shift Configuration</Text>
                        <Text style={styles.sectionSubtitle}>Assign the default work location and schedule.</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <SearchablePicker
                            label="Default Site"
                            items={sites}
                            selectedValue={siteId}
                            onValueChange={(id) => {
                                setSiteId(id);
                                const s = sites.find(x => x.id === id);
                                if (s) setSiteName(s.name);
                            }}
                            placeholder="Select Default Site"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <DateTimePickerField
                                label="Start Time"
                                value={startTime} // needs to be Date object
                                onChange={setStartTime}
                                mode="time"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <DateTimePickerField
                                label="End Time"
                                value={endTime} // needs to be Date object
                                onChange={setEndTime}
                                mode="time"
                            />
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payroll Details</Text>
                        <Text style={styles.sectionSubtitle}>Configure salary and compensation parameters.</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Monthly Salary</Text>
                        <View style={styles.iconInput}>
                            <Text style={{ marginLeft: 16, fontSize: 18, color: theme.colors.slate500 }}>₹</Text>
                            <TextInput
                                style={[styles.iconInputField, { fontWeight: '600' }]}
                                value={salary}
                                onChangeText={setSalary}
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        </View>
                        <Text style={styles.helperText}>Standard monthly base pay</Text>
                    </View>

                    <View style={styles.switchContainer}>
                        <View>
                            <Text style={styles.switchLabel}>Active Status</Text>
                            <Text style={styles.switchSubLabel}>Currently assigned to shifts</Text>
                        </View>
                        <Switch
                            value={active}
                            onValueChange={setActive}
                            trackColor={{ false: theme.colors.slate300, true: theme.colors.primary }} // primary usually too dark for track, maybe separate active color
                            thumbColor={theme.colors.white}
                        />
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
                            <Text style={styles.saveButtonText}>{isEditing ? 'Update Guard' : 'Save Guard Details'}</Text>
                        </View>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
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
        paddingBottom: 100,
    },
    section: {
        padding: theme.spacing.m,
        paddingTop: theme.spacing.l,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.slate900,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.slate500,
        marginTop: 4,
    },
    form: {
        gap: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
    },
    inputGroup: {
        gap: theme.spacing.s,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.slate900,
    },
    input: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.slate200,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m, // 15px
        height: 56,
        fontSize: 16,
        color: theme.colors.slate900,
    },
    separator: {
        height: 1,
        backgroundColor: theme.colors.slate100,
        marginVertical: theme.spacing.s,
    },
    pickerButton: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.slate200,
        borderRadius: theme.borderRadius.l,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
    },
    pickerText: {
        fontSize: 16,
        color: theme.colors.slate900,
    },
    pickerPlaceholder: {
        fontSize: 16,
        color: theme.colors.slate400, // #616189
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.m,
    },
    halfInput: {
        flex: 1,
    },
    iconInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.slate200,
        borderRadius: theme.borderRadius.l,
        height: 56,
    },
    iconInputField: {
        flex: 1,
        height: '100%',
        paddingHorizontal: theme.spacing.m,
        fontSize: 16,
        color: theme.colors.slate900,
    },
    helperText: {
        fontSize: 10,
        color: theme.colors.slate400,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginTop: 4,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.slate100,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.m,
        marginTop: theme.spacing.m,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.slate900,
    },
    switchSubLabel: {
        fontSize: 12,
        color: theme.colors.slate500,
        marginTop: 4,
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
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.slate200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalItem: {
        padding: theme.spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.slate100,
    },
    modalItemText: {
        fontSize: 16,
    },
});
