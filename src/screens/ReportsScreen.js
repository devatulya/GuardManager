import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerField from '../components/DateTimePickerField';
import SearchablePicker from '../components/SearchablePicker';
import { getGuards } from '../services/guards';
import { generateGuardWiseReport, generateSiteWiseReport } from '../services/reports';
import { getSites } from '../services/sites';
import { theme } from '../theme';

export default function ReportsScreen({ navigation }) {
    const isFocused = useIsFocused();
    const [reportType, setReportType] = useState('Site-wise'); // 'Site-wise' | 'Guard-wise'
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [sites, setSites] = useState([]);
    const [guards, setGuards] = useState([]);

    // Date State
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(new Date()); // For Guard-wise

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isFocused) {
            getSites().then(setSites);
            getGuards().then(setGuards);
        }
    }, [isFocused]);

    // Helper: set Start/End based on chips
    const setRange = (days) => {
        const end = new Date();
        const start = new Date();
        if (days === 'This Month') {
            start.setDate(1);
        } else if (days === 'Today') {
            // start is today
        } else {
            start.setDate(end.getDate() - days);
        }
        setStartDate(start);
        setEndDate(end);
    };

    const handleGenerate = async () => {
        if (!selectedEntityId) {
            alert('Please select a site or guard.');
            return;
        }

        setLoading(true);
        try {
            let data;
            // Use local time components to avoid UTC shifts
            const formatDate = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            const formatMonth = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                return `${year}-${month}`;
            };

            if (reportType === 'Site-wise') {
                data = await generateSiteWiseReport(
                    selectedEntityId,
                    formatDate(startDate),
                    formatDate(endDate)
                );
            } else {
                data = await generateGuardWiseReport(
                    selectedEntityId,
                    formatMonth(selectedMonth)
                );
            }

            navigation.navigate('ReportResults', {
                type: reportType,
                entityId: selectedEntityId,
                entityName: reportType === 'Site-wise'
                    ? sites.find(s => s.id === selectedEntityId)?.name
                    : guards.find(g => g.id === selectedEntityId)?.name,
                month: reportType === 'Site-wise'
                    ? `${formatDate(startDate)} to ${formatDate(endDate)}`
                    : formatMonth(selectedMonth),
                data
            });
        } catch (e) {
            console.error(e);
            alert(`Error generating report: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.slate900} />
                </Pressable>
                <Text style={styles.headerTitle}>Reports</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.tabs}>
                <View style={styles.tabContainer}>
                    <Pressable
                        style={[styles.tab, reportType === 'Site-wise' && styles.tabActive]}
                        onPress={() => { setReportType('Site-wise'); setSelectedEntityId(''); }}
                    >
                        <Text style={[styles.tabText, reportType === 'Site-wise' && styles.tabTextActive]}>Site-wise</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, reportType === 'Guard-wise' && styles.tabActive]}
                        onPress={() => { setReportType('Guard-wise'); setSelectedEntityId(''); }}
                    >
                        <Text style={[styles.tabText, reportType === 'Guard-wise' && styles.tabTextActive]}>Guard-wise</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Report Parameters</Text>

                <View style={styles.inputGroup}>
                    <SearchablePicker
                        label={reportType === 'Site-wise' ? 'Select Site' : 'Select Guard'}
                        selectedValue={selectedEntityId}
                        onValueChange={setSelectedEntityId}
                        items={reportType === 'Site-wise' ? sites : guards}
                        placeholder={reportType === 'Site-wise' ? 'Search Site...' : 'Search Guard...'}
                    />
                </View>

                <Text style={[styles.label, { marginTop: 16 }]}>
                    {reportType === 'Site-wise' ? 'Select Date Range' : 'Select Month'}
                </Text>

                <View style={styles.calendarCard}>
                    {reportType === 'Site-wise' ? (
                        <View style={{ gap: 16 }}>
                            <DateTimePickerField
                                label="Start Date"
                                value={startDate}
                                onChange={setStartDate}
                                mode="date"
                            />
                            <DateTimePickerField
                                label="End Date"
                                value={endDate}
                                onChange={setEndDate}
                                mode="date"
                            />

                            <View style={styles.quickRange}>
                                <Pressable style={styles.rangeChip} onPress={() => setRange('Today')}>
                                    <Text style={styles.rangeText}>Today</Text>
                                </Pressable>
                                <Pressable style={styles.rangeChip} onPress={() => setRange(7)}>
                                    <Text style={styles.rangeText}>Last 7 Days</Text>
                                </Pressable>
                                <Pressable style={styles.rangeChip} onPress={() => setRange('This Month')}>
                                    <Text style={styles.rangeText}>This Month</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text style={{ marginBottom: 8, color: theme.colors.slate500, fontStyle: 'italic' }}>
                                Note: Selecting any day in a month selects that month.
                            </Text>
                            <DateTimePickerField
                                label="Select Month (Pick any date)"
                                value={selectedMonth}
                                onChange={setSelectedMonth}
                                mode="date"
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={styles.primaryButton}
                    onPress={handleGenerate}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : (
                        <>
                            <MaterialIcons name="description" size={24} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Generate Report</Text>
                        </>
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
    tabs: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.white,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.slate100,
        borderRadius: theme.borderRadius.l,
        padding: 4,
        height: 48,
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius.m,
    },
    tabActive: {
        backgroundColor: theme.colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.slate500,
    },
    tabTextActive: {
        color: theme.colors.slate900,
    },
    content: {
        padding: theme.spacing.m,
        paddingBottom: 150,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.slate900,
        marginBottom: theme.spacing.m,
    },
    inputGroup: {
        marginBottom: theme.spacing.l,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.slate600,
        marginBottom: 8,
    },
    calendarCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.slate100,
        padding: theme.spacing.m,
        marginTop: 8,
    },
    quickRange: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
        flexWrap: 'wrap',
    },
    rangeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.slate200,
        backgroundColor: theme.colors.slate50,
    },
    rangeText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.slate600,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing.m,
        paddingBottom: 32,
        backgroundColor: '#ffffffCC',
        borderTopWidth: 1,
        borderTopColor: theme.colors.slate100,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        height: 56,
        borderRadius: theme.borderRadius.xl,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
