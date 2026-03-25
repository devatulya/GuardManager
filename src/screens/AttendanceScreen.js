import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import DateTimePickerField from '../components/DateTimePickerField';
import ScreenWrapper from '../components/ScreenWrapper';
import SearchablePicker from '../components/SearchablePicker';
import Text from '../components/Text';
import { useTheme } from '../context/ThemeContext';
import { getAttendanceByDate, getAttendanceProgress, markAttendance, markBulkCustomAttendance, markGlobalAttendance } from '../services/attendance';
import { getGuards } from '../services/guards';
import { getSites } from '../services/sites';
import { formatDate } from '../utils/date';

// Alternating site colors for visual differentiation
const SITE_COLORS = [
    { bg: '#dc262615', border: '#dc2626', text: '#dc2626', light: '#fef2f2' },  // Red
    { bg: '#2563eb15', border: '#2563eb', text: '#2563eb', light: '#eff6ff' },  // Blue
];

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

    const [shiftType, setShiftType] = useState('Day');

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ total: 0, present: 0 });

    // Copy Previous Day State
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [previousAttendance, setPreviousAttendance] = useState([]);
    const [selectedToCopy, setSelectedToCopy] = useState(new Set());
    const [fetchingPrevious, setFetchingPrevious] = useState(false);

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

    // Auto-fill shift when guard is selected
    useEffect(() => {
        if (selectedGuardId) {
            const guard = guards.find(g => g.id === selectedGuardId);
            if (guard) {
                if (guard.shiftType) {
                    setShiftType(guard.shiftType);
                } else {
                    setShiftType('Day');
                }

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

    const handleOpenCopyModal = async () => {
        setFetchingPrevious(true);
        setShowCopyModal(true);
        try {
            // Get yesterday's date string relative to currently selected date
            const yesterday = new Date(date);
            yesterday.setDate(yesterday.getDate() - 1);
            const prevDateStr = getLocalISODate(yesterday);

            const records = await getAttendanceByDate(prevDateStr);
            const sortedRecords = (records || []).sort((a, b) => {
                const siteA = a.siteName ? a.siteName.toLowerCase() : '';
                const siteB = b.siteName ? b.siteName.toLowerCase() : '';
                if (siteA < siteB) return -1;
                if (siteA > siteB) return 1;
                const shiftCmp = (a.shiftType === 'Night' ? 1 : 0) - (b.shiftType === 'Night' ? 1 : 0);
                return shiftCmp || (a.guardName || '').localeCompare(b.guardName || '');
            });
            setPreviousAttendance(sortedRecords);
            // By default, select all
            setSelectedToCopy(new Set(sortedRecords.map(r => r.id)));
        } catch (e) {
            Alert.alert("Error", "Could not fetch previous day's attendance.");
            setShowCopyModal(false);
        } finally {
            setFetchingPrevious(false);
        }
    };

    const toggleCopySelection = (recordId) => {
        const newSet = new Set(selectedToCopy);
        if (newSet.has(recordId)) newSet.delete(recordId);
        else newSet.add(recordId);
        setSelectedToCopy(newSet);
    };

    const handleSaveCopiedAttendance = async () => {
        if (selectedToCopy.size === 0) {
            Alert.alert("Notice", "No guards selected to copy.");
            return;
        }

        setLoading(true);
        try {
            // Filter the records that are selected
            const recordsToSave = previousAttendance
                .filter(r => selectedToCopy.has(r.id))
                .map(r => ({
                    ...r,
                    date: getLocalISODate(date) // overwrite date to current selected date
                }));

            const count = await markBulkCustomAttendance(recordsToSave);
            await fetchProgress();
            setShowCopyModal(false);
            Alert.alert("Success", `Copied ${count} guard(s) attendance to ${getLocalISODate(date)}.`);
        } catch (e) {
            Alert.alert("Error", "Could not save copied attendance.");
        } finally {
            setLoading(false);
        }
    };

    const handleManualSave = async () => {
        if (!selectedGuardId || !selectedSiteId) {
            Alert.alert('Error', 'Please select a site and a guard.');
            return;
        }
        setLoading(true);
        try {
            const guard = guards.find(g => g.id === selectedGuardId);
            // Use GLOBAL DATE
            const targetDateStr = getLocalISODate(date);

            await markAttendance({
                guardId: selectedGuardId,
                guardName: guard?.name,
                siteId: selectedSiteId,
                siteName: sites.find(s => s.id === selectedSiteId)?.name,
                date: targetDateStr,
                shiftType: shiftType,
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
        <ScreenWrapper edges={['top', 'left', 'right']} style={styles.container}>
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
                            {progress.present} of {progress.total} sites covered
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

                    {/* Copy Previous Day Button */}
                    <Pressable
                        style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
                        onPress={handleOpenCopyModal}
                    >
                        <MaterialIcons name="content-copy" size={24} color={theme.colors.tertiary} style={{ marginRight: 8 }} />
                        <Text style={styles.copyButtonText}>Copy Last Day's Attendance</Text>
                    </Pressable>
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

                        <View style={{ height: 16 }} />

                        {/* Shift Type Selector */}
                        <View style={styles.segmentedControl}>
                            <Pressable
                                style={[styles.segmentButton, shiftType === 'Day' && styles.segmentButtonActive]}
                                onPress={() => setShiftType('Day')}
                            >
                                <MaterialIcons name="wb-sunny" size={20} color={shiftType === 'Day' ? '#f59e0b' : theme.colors.textSecondary} style={{ marginRight: 8 }} />
                                <Text style={[styles.segmentText, shiftType === 'Day' && styles.segmentTextActive]}>Day Shift</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.segmentButton, shiftType === 'Night' && styles.segmentButtonNightActive]}
                                onPress={() => setShiftType('Night')}
                            >
                                <MaterialIcons name="nights-stay" size={20} color={shiftType === 'Night' ? '#3b82f6' : theme.colors.textSecondary} style={{ marginRight: 8 }} />
                                <Text style={[styles.segmentText, shiftType === 'Night' && styles.segmentTextNightActive]}>Night Shift</Text>
                            </Pressable>
                        </View>

                        <View style={{ height: 16 }} />

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

            {/* Copy Previous Day Modal */}
            <Modal
                visible={showCopyModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCopyModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Preview Previous Day</Text>
                            <Pressable onPress={() => setShowCopyModal(false)}>
                                <MaterialIcons name="close" size={24} color={theme.colors.text} />
                            </Pressable>
                        </View>

                        {fetchingPrevious ? (
                            <View style={styles.modalLoading}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>Fetching records...</Text>
                            </View>
                        ) : previousAttendance.length === 0 ? (
                            <View style={styles.modalEmpty}>
                                <MaterialIcons name="event-busy" size={48} color={theme.colors.textSecondary} style={{ marginBottom: 16 }} />
                                <Text style={styles.modalEmptyText}>No attendance records found for yesterday.</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.modalControls}>
                                    <Pressable
                                        style={styles.selectAllToggle}
                                        onPress={() => {
                                            if (selectedToCopy.size === previousAttendance.length) {
                                                setSelectedToCopy(new Set()); // Deselect all
                                            } else {
                                                setSelectedToCopy(new Set(previousAttendance.map(r => r.id))); // Select all
                                            }
                                        }}
                                    >
                                        <MaterialIcons
                                            name={selectedToCopy.size === previousAttendance.length ? "check-box" : "check-box-outline-blank"}
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                        <Text style={styles.selectAllText}>
                                            {selectedToCopy.size === previousAttendance.length ? "Deselect All" : "Select All"} ({selectedToCopy.size}/{previousAttendance.length})
                                        </Text>
                                    </Pressable>
                                </View>

                                <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                                    {(() => {
                                        // Build site color map from sorted records
                                        const siteColorMap = {};
                                        let siteIndex = 0;
                                        previousAttendance.forEach(r => {
                                            const siteName = (r.siteName || 'Unknown Site').toLowerCase();
                                            if (!(siteName in siteColorMap)) {
                                                siteColorMap[siteName] = SITE_COLORS[siteIndex % 2];
                                                siteIndex++;
                                            }
                                        });

                                        let lastSiteName = null;
                                        return previousAttendance.map(record => {
                                            const isSelected = selectedToCopy.has(record.id);
                                            const siteName = (record.siteName || 'Unknown Site').toLowerCase();
                                            const siteColor = siteColorMap[siteName];
                                            const showSiteHeader = lastSiteName !== siteName;
                                            lastSiteName = siteName;

                                            return (
                                                <View key={record.id}>
                                                    {showSiteHeader && (
                                                        <View style={[
                                                            styles.siteGroupHeader,
                                                            { backgroundColor: siteColor.bg, borderLeftColor: siteColor.border }
                                                        ]}>
                                                            <MaterialIcons name="location-on" size={16} color={siteColor.text} />
                                                            <Text style={[styles.siteGroupHeaderText, { color: siteColor.text }]}>
                                                                {record.siteName || 'Unknown Site'}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <Pressable
                                                        style={[
                                                            styles.modalListItem,
                                                            { borderLeftWidth: 3, borderLeftColor: siteColor.border },
                                                            isSelected && { borderColor: siteColor.border, borderWidth: 2, borderLeftWidth: 3 }
                                                        ]}
                                                        onPress={() => toggleCopySelection(record.id)}
                                                    >
                                                        <MaterialIcons
                                                            name={isSelected ? "check-box" : "check-box-outline-blank"}
                                                            size={24}
                                                            color={isSelected ? siteColor.text : theme.colors.textSecondary}
                                                        />
                                                        <View style={styles.modalListItemTextContainer}>
                                                            <Text style={styles.modalListItemName}>{record.guardName}</Text>
                                                            <Text style={[styles.modalListItemSite, { color: siteColor.text }]}>@ {record.siteName || 'Unknown Site'}</Text>
                                                        </View>
                                                        <Text style={styles.modalListItemTime}>
                                                            {record.shiftType === 'Night' ? 'Night Shift' : 'Day Shift'}
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            );
                                        });
                                    })()}
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <Pressable
                                        style={[styles.modalSaveButton, selectedToCopy.size === 0 && styles.modalSaveButtonDisabled]}
                                        onPress={handleSaveCopiedAttendance}
                                        disabled={selectedToCopy.size === 0 || loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text style={styles.modalSaveButtonText}>Mark {selectedToCopy.size} Present</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
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
        ...theme.shadows.clayRaised,
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
        ...theme.shadows.clayRaised,
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
        backgroundColor: theme.colors.tertiary,
        height: 52,
        borderRadius: theme.borderRadius.xl,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.tertiary,
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
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.tertiary,
        backgroundColor: `${theme.colors.tertiary}18`,
        marginTop: 8,
    },
    copyButtonText: {
        color: theme.colors.tertiary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.backgroundLight,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        height: '80%',
        padding: theme.spacing.m,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    modalLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalEmptyText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    modalControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    selectAllToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    selectAllText: {
        marginLeft: 8,
        color: theme.colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    modalList: {
        flex: 1,
    },
    siteGroupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 12,
        marginBottom: 6,
        borderLeftWidth: 3,
        borderRadius: 6,
    },
    siteGroupHeaderText: {
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    modalListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        backgroundColor: theme.colors.cardBackground,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.clayRaised,
    },
    modalListItemTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    modalListItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    modalListItemSite: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    modalListItemTime: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
    },
    modalFooter: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        marginTop: 8,
    },
    modalSaveButton: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: theme.borderRadius.l,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSaveButtonDisabled: {
        backgroundColor: theme.colors.border,
    },
    modalSaveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    segmentedControl: {
        flexDirection: 'row',
        gap: 6,
        height: 48,
    },
    segmentButton: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    segmentButtonActive: {
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    segmentButtonNightActive: {
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 2,
        borderColor: '#3b82f6',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    segmentTextActive: {
        color: theme.colors.primary,
    },
    segmentTextNightActive: {
        color: '#3b82f6',
    },
});
