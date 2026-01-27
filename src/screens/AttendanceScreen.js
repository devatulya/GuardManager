import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerField from '../components/DateTimePickerField';
import SearchablePicker from '../components/SearchablePicker';
import { getAttendanceProgress, markAttendance, markGlobalAttendance } from '../services/attendance';
import { getGuards } from '../services/guards';
import { getSites } from '../services/sites';
import { theme } from '../theme';
import { formatDate } from '../utils/date';

// Force IST Date string for calculations

// Force IST Date string for calculations
const getLocalISODate = (date) => {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
};

export default function AttendanceScreen({ navigation }) {
    // 1. GLOBAL DATE STATE
    const [date, setDate] = useState(new Date());

    const [sites, setSites] = useState([]);
    const [guards, setGuards] = useState([]);

    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [selectedGuardId, setSelectedGuardId] = useState('');

    const [startTime, setStartTime] = useState(new Date(new Date().setHours(8, 0, 0, 0)));
    const [endTime, setEndTime] = useState(new Date(new Date().setHours(20, 0, 0, 0))); // Default 8pm

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ total: 0, present: 0 });

    const fetchData = async () => {
        try {
            const [sitesData, guardsData] = await Promise.all([getSites(), getGuards()]);
            setSites(sitesData);
            setGuards(guardsData);

            if (sitesData.length > 0 && !selectedSiteId) {
                setSelectedSiteId(sitesData[0].id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchProgress = async () => {
        const p = await getAttendanceProgress(getLocalISODate(date));
        setProgress(p);
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
            fetchProgress();
        }, [date]) // Refetch progress when global date changes
    );

    // Auto-fill times when guard is selected
    useEffect(() => {
        if (selectedGuardId) {
            const guard = guards.find(g => g.id === selectedGuardId);
            if (guard) {
                const parseTime = (timeStr) => {
                    const d = new Date();
                    if (!timeStr) return d;
                    const [h, m] = timeStr.split(':');
                    d.setHours(parseInt(h), parseInt(m), 0, 0);
                    return d;
                };

                if (guard.defaultStartTime) setStartTime(parseTime(guard.defaultStartTime));
                else setStartTime(new Date(new Date().setHours(8, 0, 0, 0)));

                if (guard.defaultEndTime) setEndTime(parseTime(guard.defaultEndTime));
                else setEndTime(new Date(new Date().setHours(20, 0, 0, 0)));

                if (guard.defaultSiteId) {
                    const siteExists = sites.find(s => s.id === guard.defaultSiteId);
                    if (siteExists) setSelectedSiteId(guard.defaultSiteId);
                }
            }
        }
    }, [selectedGuardId]);

    const handleMarkAll = () => {
        Alert.alert(
            'Mark All Active Guards?',
            `This will mark ALL active guards present at their default sites for selected date: ${getLocalISODate(date)}.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const count = await markGlobalAttendance(getLocalISODate(date));
                            await fetchProgress();
                            Alert.alert('Success', `Marked ${count} guards present system-wide.`);
                        } catch (e) {
                            Alert.alert('Error', e.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleManualSave = async () => {
        if (!selectedGuardId || !selectedSiteId) {
            Alert.alert('Error', 'Please select a site and a guard.');
            return;
        }
        setLoading(true);
        try {
            const guard = guards.find(g => g.id === selectedGuardId);
            const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

            // Use GLOBAL DATE
            const targetDateStr = getLocalISODate(date);

            await markAttendance({
                guardId: selectedGuardId,
                guardName: guard?.name,
                siteId: selectedSiteId,
                siteName: sites.find(s => s.id === selectedSiteId)?.name,
                date: targetDateStr,
                startTime: formatTime(startTime),
                endTime: formatTime(endTime),
            });
            await fetchProgress();

            // Reset selection for faster entry
            setSelectedGuardId('');
            Alert.alert('Success', 'Attendance saved.');
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. GLOBAL DATE SELECTOR */}
            <View style={styles.header}>
                <Pressable
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <View style={styles.profileIconContainer}>
                        <MaterialIcons name="person" size={24} color={theme.colors.primary} />
                    </View>
                </Pressable>

                <View style={styles.dateSelector}>
                    <Text style={styles.dateLabel}>SELECTED DATE</Text>
                    <DateTimePickerField
                        label=" " // Hidden label
                        value={date}
                        onChange={setDate}
                        mode="date"
                        displayValue={formatDate(date)}
                    />
                </View>

                <Pressable
                    style={styles.notificationIcon}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <MaterialIcons name="notifications" size={24} color={theme.colors.slate900} />
                    <View style={styles.badge} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Progress Card */}
                <View style={styles.progressCard}>
                    <View style={styles.progressIcon}>
                        <MaterialIcons name="analytics" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.progressContent}>
                        <Text style={styles.progressTitle}>Daily Progress</Text>
                        <Text style={styles.progressSubtitle}>
                            {progress.present} of {progress.total} active guards present
                        </Text>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progress.total === 0 ? 0 : (progress.present / progress.total) * 100}%` }]} />
                        </View>
                    </View>
                </View>

                {/* Mark All Section */}
                <View style={styles.section}>
                    <Pressable
                        style={({ pressed }) => [styles.markAllButton, pressed && styles.pressed]}
                        onPress={handleMarkAll}
                    >
                        {loading ? <ActivityIndicator color="white" /> : (
                            <>
                                <MaterialIcons name="check-circle" size={28} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.markAllText}>Mark All Present</Text>
                            </>
                        )}
                    </Pressable>
                    <Text style={styles.helperText}>Marks all guards for selected date</Text>
                </View>

                {/* Manual Entry Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>MANUAL ENTRY</Text>
                    </View>
                    <View style={styles.card}>
                        <SearchablePicker
                            label="Site Location"
                            items={sites}
                            selectedValue={selectedSiteId}
                            onValueChange={setSelectedSiteId}
                            placeholder="Select Site..."
                        />

                        <View style={{ height: 16 }} />

                        <SearchablePicker
                            label="Security Personnel"
                            items={guards}
                            selectedValue={selectedGuardId}
                            onValueChange={setSelectedGuardId}
                            placeholder="Select Guard..."
                        />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <DateTimePickerField
                                    label="Start Time"
                                    value={startTime}
                                    onChange={setStartTime}
                                    mode="time"
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <DateTimePickerField
                                    label="End Time"
                                    value={endTime}
                                    onChange={setEndTime}
                                    mode="time"
                                />
                            </View>
                        </View>

                        {/* NO DATE PICKER HERE anymore */}

                        <Pressable
                            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
                            onPress={handleManualSave}
                            disabled={loading}
                        >
                            <MaterialIcons name="save" size={24} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>Add Attendance</Text>
                        </Pressable>
                    </View>
                </View>

                {/* 3. REVIEW BUTTON */}
                <View style={styles.section}>
                    <Pressable
                        style={({ pressed }) => [styles.reviewButton, pressed && styles.pressed]}
                        onPress={() => navigation.navigate('AttendanceReview', { date: getLocalISODate(date) })} // Pass ISO date string
                    >
                        <MaterialIcons name="date-range" size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                        <Text style={styles.reviewButtonText}>View Attendance for {formatDate(date)}</Text>
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.slate400} style={{ marginLeft: 'auto' }} />
                    </Pressable>
                </View>

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.slate200,
        paddingTop: 16, // Extra safe area
    },
    profileButton: {
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${theme.colors.primary}1A`, // Light primary bg
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateSelector: {
        flex: 1,
        marginRight: 16,
        justifyContent: 'center',
    },
    dateLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 4,
        letterSpacing: 1,
    },
    dateDisplay: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.slate900,
        marginTop: -38, // HACK: Overlay on top of transparent picker
        pointerEvents: 'none', // Let click pass to picker
        marginBottom: 8,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.danger,
        borderWidth: 2,
        borderColor: 'white',
    },
    content: {
        padding: theme.spacing.m,
        gap: theme.spacing.l,
        paddingBottom: 100,
    },
    section: {
        gap: theme.spacing.s,
    },
    progressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.slate200,
        padding: theme.spacing.m,
        gap: theme.spacing.m,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    progressIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${theme.colors.primary}1A`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContent: {
        flex: 1,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.slate900,
    },
    progressSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.slate500,
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: theme.colors.slate100,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 3,
    },
    markAllButton: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: theme.borderRadius.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    markAllText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    helperText: {
        textAlign: 'center',
        color: theme.colors.slate500,
        fontSize: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.slate500,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.slate200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        marginTop: 16,
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
    },
    saveButton: {
        backgroundColor: theme.colors.success,
        height: 52,
        borderRadius: theme.borderRadius.xl,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
    },
    reviewButtonText: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: '600',
    },
});
