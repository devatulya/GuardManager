import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerField from '../components/DateTimePickerField';
import SearchablePicker from '../components/SearchablePicker';
import { useTheme } from '../context/ThemeContext';
import { getAttendanceProgress, markAttendance, markGlobalAttendance } from '../services/attendance';
import { getGuards } from '../services/guards';
import { getSites } from '../services/sites';
import { formatDate } from '../utils/date';

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
    const { theme, setThemeMode, themeMode } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    // 1. GLOBAL DATE STATE
    const [date, setDate] = useState(new Date());

    const [sites, setSites] = useState([]);
    const [guards, setGuards] = useState([]);

    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [selectedGuardId, setSelectedGuardId] = useState('');

    const [hasManuallySelectedSite, setHasManuallySelectedSite] = useState(false);

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

                // Only auto-fill site if user hasn't manually selected one
                if (guard.defaultSiteId && !hasManuallySelectedSite) {
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
            // Do NOT reset site, keep current selection context
            Alert.alert('Success', 'Attendance saved.');
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSiteChange = (siteId) => {
        setSelectedSiteId(siteId);
        setHasManuallySelectedSite(true);
    };

    const handleThemeToggle = () => {
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
                        theme={theme} // Pass theme to component if it accepts it, otherwise it uses static? It might need refactor too.
                    />
                </View>

                <View style={styles.headerActions}>
                    <Pressable
                        style={styles.iconButton}
                        onPress={handleThemeToggle}
                    >
                        <MaterialIcons
                            name={themeMode === 'dark' ? 'dark-mode' : (themeMode === 'light' ? 'light-mode' : 'settings-brightness')}
                            size={24}
                            color={theme.colors.text}
                        />
                    </Pressable>

                    <Pressable
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <MaterialIcons name="notifications" size={24} color={theme.colors.text} />
                        <View style={styles.badge} />
                    </Pressable>
                </View>
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
                            onValueChange={handleSiteChange}
                            placeholder="Select Site..."
                            theme={theme}
                        />

                        <View style={{ height: 16 }} />

                        <SearchablePicker
                            label="Security Personnel"
                            items={guards}
                            selectedValue={selectedGuardId}
                            onValueChange={setSelectedGuardId}
                            placeholder="Select Guard..."
                            theme={theme}
                        />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <DateTimePickerField
                                    label="Start Time"
                                    value={startTime}
                                    onChange={setStartTime}
                                    mode="time"
                                    theme={theme}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <DateTimePickerField
                                    label="End Time"
                                    value={endTime}
                                    onChange={setEndTime}
                                    mode="time"
                                    theme={theme}
                                />
                            </View>
                        </View>

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
                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} style={{ marginLeft: 'auto' }} />
                    </Pressable>
                </View>

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.headerBackground,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
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
        color: theme.colors.text,
        marginTop: -38, // HACK: Overlay
        pointerEvents: 'none',
        marginBottom: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationIcon: {
        // Redundant if handled by iconButton
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
        borderColor: theme.colors.headerBackground,
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
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        color: theme.colors.text,
    },
    progressSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: theme.colors.border, // slate100/700
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
        color: 'white', // Primary buttons usually keep white text even in dark mode? Or should adapt? contrast usually safe.
        fontSize: 18,
        fontWeight: 'bold',
    },
    helperText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
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
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        backgroundColor: theme.colors.cardBackground,
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
