import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Text from '../components/Text';
import { theme } from '../theme';

import { shareExcel, sharePDF } from '../services/reporting';
import { formatDate } from '../utils/date';

// Helper to convert legacy explicit times to Shift Type
export const parseLegacyShift = (item) => {
    if (item.shiftType) {
        return item.shiftType === 'Day' ? 'Day Shift' : 'Night Shift';
    }

    // Fallback parsing for legacy "startTime" and "endTime"
    if (!item.startTime || !item.endTime || item.startTime === '-' || item.endTime === '-') {
        return '-';
    }

    // Usually 08:00 to 20:00 is Day, 20:00 to 08:00 is Night
    // We'll check the start time hour
    const startHour = parseInt(item.startTime.split(':')[0], 10);

    // The user requested: 8am to 8pm is Day Shift, 8pm to 8am is Night Shift.
    // 08:00 (inclusive) up to 20:00 (exclusive of 20:xx starting hours unless exact 20:00, but logic dictates >= 8 and < 20 for standard)
    if (startHour >= 8 && startHour < 20) {
        return 'Day Shift';
    } else {
        return 'Night Shift';
    }
};

export default function ReportResultsScreen({ route, navigation }) {
    const { type, entityName, month, data } = route.params || {};

    const handleExport = () => {
        Alert.alert(
            "Export Report",
            "Choose a format to share",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Share as PDF",
                    onPress: () => sharePDF(type, entityName, month, data).catch(e => Alert.alert("Error", e.message))
                },
                {
                    text: "Share as Excel",
                    onPress: () => shareExcel(type, entityName, month, data).catch(e => Alert.alert("Error", e.message))
                }
            ]
        );
    };

    // Calculate Site-wise report summary
    const siteSummary = useMemo(() => {
        if (type !== 'Site-wise' || !data) return null;

        const dutiesCount = data.length;
        const guardMap = {};
        const groupedByDate = {};

        data.forEach(item => {
            // Guard duty count
            guardMap[item.guardName] = (guardMap[item.guardName] || 0) + 1;

            // Group by Date
            if (!groupedByDate[item.date]) groupedByDate[item.date] = [];
            groupedByDate[item.date].push(item);
        });

        const sortedDates = Object.keys(groupedByDate).sort();
        const groupedData = sortedDates.map(date => ({
            date,
            records: groupedByDate[date].sort((a, b) => {
                const shiftCmp = (a.shiftType === 'Night' ? 1 : 0) - (b.shiftType === 'Night' ? 1 : 0);
                return shiftCmp || a.guardName.localeCompare(b.guardName);
            })
        }));

        return {
            totalDuties: dutiesCount,
            totalGuards: Object.keys(guardMap).length,
            guardDuties: Object.entries(guardMap).map(([name, count]) => ({ name, count })),
            groupedData
        };
    }, [data, type]);

    // Calculate Daily report summary (Grouped by Site)
    const dailySummary = useMemo(() => {
        if (type !== 'Daily' || !data) return null;

        const groupedBySite = {};

        data.forEach(item => {
            if (!groupedBySite[item.siteName]) groupedBySite[item.siteName] = [];
            groupedBySite[item.siteName].push(item);
        });

        const sortedSites = Object.keys(groupedBySite).sort();
        const groupedData = sortedSites.map(siteName => ({
            siteName,
            records: groupedBySite[siteName].sort((a, b) => {
                const shiftCmp = (a.shiftType === 'Night' ? 1 : 0) - (b.shiftType === 'Night' ? 1 : 0);
                return shiftCmp || a.guardName.localeCompare(b.guardName);
            })
        }));

        return {
            groupedData
        };
    }, [data, type]);
    const renderSiteReportItem = ({ item }) => (
        <View style={styles.rowItem}>
            <View style={styles.colDate}><Text style={styles.cellText}>{formatDate(item.date)}</Text></View>
            <View style={styles.colLarge}><Text style={styles.cellText}>{item.guardName}</Text></View>
            <View style={styles.colTime}><Text style={styles.cellText}>{item.startTime}</Text></View>
            <View style={styles.colTime}><Text style={styles.cellText}>{item.endTime}</Text></View>
        </View>
    );

    const renderDailyReportItem = ({ item }) => (
        <View style={styles.rowItem}>
            <View style={styles.colLarge}><Text style={styles.cellText}>{item.siteName}</Text></View>
            <View style={styles.colMedium}><Text style={styles.cellText}>{item.guardName}</Text></View>
            <View style={styles.colTimeRange}><Text style={styles.cellText}>{parseLegacyShift(item)}</Text></View>
        </View>
    );

    const renderGuardReport = () => {
        if (!data || !data.attendance) return <Text>No Data</Text>;
        return (
            <ScrollView style={styles.guardContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Salary Statement</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Month:</Text>
                        <Text style={styles.summaryValue}>{data.month}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Days Worked:</Text>
                        <Text style={styles.summaryValue}>{data.daysWorked}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Monthly Salary:</Text>
                        <Text style={styles.summaryValue}>₹{data.monthlySalary}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Advances:</Text>
                        <Text style={styles.summaryValue}>- ₹{data.totalAdvances}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Final Payable:</Text>
                        <Text style={styles.totalValue}>₹{data.finalPayable}</Text>
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Attendance History</Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.colDate]}>Date</Text>
                    <Text style={[styles.headerCell, styles.colLarge]}>Site</Text>
                    <Text style={[styles.headerCell, styles.colTimeRange]}>Shift</Text>
                </View>
                {data.attendance.map((item, index) => (
                    <View key={index} style={styles.rowItem}>
                        <View style={styles.colDate}><Text style={styles.cellText}>{formatDate(item.date)}</Text></View>
                        <View style={styles.colLarge}><Text style={styles.cellText}>{item.siteName}</Text></View>
                        <View style={styles.colTimeRange}><Text style={styles.cellText}>{parseLegacyShift(item)}</Text></View>
                    </View>
                ))}

                <View style={{ marginTop: 24 }} />
                <Text style={styles.sectionHeader}>Advances History</Text>
                {(!data.advancesList || data.advancesList.length === 0) ? (
                    <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 12 }}>No advances this month</Text>
                ) : (
                    <>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCell, styles.colDate]}>Date Given</Text>
                            <Text style={[styles.headerCell, styles.colMedium]}>Amount</Text>
                        </View>
                        {data.advancesList.map((adv, index) => (
                            <View key={`adv-${index}`} style={styles.rowItem}>
                                <View style={styles.colDate}><Text style={styles.cellText}>{formatDate(adv.date)}</Text></View>
                                <View style={styles.colMedium}><Text style={[styles.cellText, { color: theme.colors.danger, fontWeight: 'bold' }]}>-₹{adv.amount}</Text></View>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        );
    };

    const renderAllGuardsPayoutReport = () => {
        if (!data || data.length === 0) return <Text style={styles.noDataText}>No payout data found.</Text>;
        const totalPayout = data.reduce((acc, curr) => acc + (Number(curr.payout) || 0), 0);
        return (
            <ScrollView style={styles.guardContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Payout Report — {month}</Text>
                    <View style={[styles.summaryRow, { marginTop: 8 }]}>
                        <Text style={styles.summaryLabel}>Total Guards:</Text>
                        <Text style={styles.summaryValue}>{data.length}</Text>
                    </View>
                </View>

                <View style={[styles.tableHeader, { backgroundColor: theme.colors.slate200, paddingHorizontal: 12 }]}>
                    <Text style={[styles.headerCell, { flex: 3 }]}>Guard Name</Text>
                    <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'center' }]}>Duties</Text>
                    <Text style={[styles.headerCell, { flex: 2, textAlign: 'right' }]}>Advanced</Text>
                    <Text style={[styles.headerCell, { flex: 2, textAlign: 'right' }]}>Payout</Text>
                </View>

                {data.map((item, index) => (
                    <View key={index} style={[styles.rowItem, { paddingVertical: 10, paddingHorizontal: 12 }]}>
                        <View style={{ flex: 3 }}>
                            <Text style={styles.cellText} numberOfLines={1}>{item.guardName}</Text>
                        </View>
                        <View style={{ flex: 1.5, alignItems: 'center' }}>
                            <Text style={styles.cellText}>{item.duties}</Text>
                        </View>
                        <View style={{ flex: 2, alignItems: 'flex-end' }}>
                            <Text style={[styles.cellText, { color: '#ef4444' }]}>₹{item.advanced}</Text>
                        </View>
                        <View style={{ flex: 2, alignItems: 'flex-end' }}>
                            <Text style={[styles.cellText, { fontWeight: 'bold' }]}>₹{item.payout}</Text>
                        </View>
                    </View>
                ))}

                {/* Totals Row — aligned to table columns */}
                <View style={[styles.rowItem, {
                    borderWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: theme.colors.slate300,
                    marginTop: 4,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    backgroundColor: '#f0fdf4',
                    borderRadius: 8,
                }]}>
                    <View style={{ flex: 3 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: theme.colors.slate800 }}>TOTAL</Text>
                    </View>
                    <View style={{ flex: 1.5 }} />
                    <View style={{ flex: 2, alignItems: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#ef4444' }}>
                            ₹{data.reduce((acc, curr) => acc + (Number(curr.advanced) || 0), 0)}
                        </Text>
                    </View>
                    <View style={{ flex: 2, alignItems: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#10b981' }}>₹{totalPayout}</Text>
                    </View>
                </View>
            </ScrollView>
        );
    };

    return (
        <ScreenWrapper edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </Pressable>
                <Text style={styles.title}>{type} Report</Text>
                <Pressable onPress={handleExport}>
                    <MaterialIcons name="share" size={24} color={theme.colors.primary} />
                </Pressable>
            </View>
            <View style={styles.subHeader}>
                <Text style={styles.subTitle}>{entityName}</Text>
                <Text style={styles.subDate}>{month}</Text>
            </View>

            <View style={styles.content}>
                {type === 'Site-wise' && siteSummary ? (
                    <ScrollView style={styles.guardContainer}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Site Name - {entityName}</Text>
                            <View style={[styles.summaryRow, { marginTop: 8 }]}>
                                <Text style={styles.summaryLabel}>Total duties done -</Text>
                                <Text style={styles.summaryValue}>{siteSummary.totalDuties}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Guard worked -</Text>
                                <Text style={styles.summaryValue}>{siteSummary.totalGuards}</Text>
                            </View>
                            <View style={{ marginTop: 8, paddingLeft: 16 }}>
                                {siteSummary.guardDuties.map((g, idx) => (
                                    <Text key={idx} style={{ color: theme.colors.slate600, fontSize: 13, marginBottom: 4 }}>
                                        {g.name} - {g.count} duties
                                    </Text>
                                ))}
                            </View>
                        </View>

                        <Text style={styles.sectionHeader}>Grouped by Date</Text>
                        {siteSummary.groupedData.map((group, gIdx) => (
                            <View key={gIdx} style={{ marginBottom: 16 }}>
                                <View style={[styles.tableHeader, { backgroundColor: theme.colors.slate200 }]}>
                                    <Text style={[styles.headerCell, { flex: 1 }]}>{formatDate(group.date)} -</Text>
                                </View>
                                {group.records.map((item, rIdx) => {
                                    const formattedShift = parseLegacyShift(item);

                                    return (
                                        <View key={rIdx} style={[styles.rowItem, { paddingVertical: 8 }]}>
                                            <View style={{ flex: 1.5, paddingLeft: 8 }}>
                                                <Text style={styles.cellText}>{item.guardName}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.cellText, { color: theme.colors.slate600 }]}>{formattedShift}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                ) : type === 'Daily' ? (
                    <>
                        {data.length === 0 ? (
                            <Text style={styles.noDataText}>No attendance records found for this date.</Text>
                        ) : (
                            <ScrollView style={styles.guardContainer}>
                                <View style={[styles.tableHeader, { backgroundColor: theme.colors.slate200, marginBottom: 16 }]}>
                                    <Text style={[styles.headerCell, { flex: 1, fontSize: 14 }]}>Date - {month}</Text>
                                </View>

                                {dailySummary?.groupedData.map((group, gIdx) => (
                                    <View key={gIdx} style={{ marginBottom: 20 }}>
                                        <View style={{ marginBottom: 8 }}>
                                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.slate800, paddingLeft: 8 }}>
                                                Site Name - {group.siteName}
                                            </Text>
                                        </View>
                                        <View style={[styles.tableHeader, { backgroundColor: 'transparent', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 4, paddingTop: 4 }]}>
                                            <Text style={[styles.headerCell, { flex: 1.5, paddingLeft: 8 }]}>Guards -</Text>
                                            <Text style={[styles.headerCell, { flex: 1 }]}>Shift</Text>
                                        </View>

                                        {group.records.map((item, rIdx) => {
                                            const formattedShift = parseLegacyShift(item);
                                            return (
                                                <View key={rIdx} style={[styles.rowItem, { paddingVertical: 8, borderBottomWidth: 0 }]}>
                                                    <View style={{ flex: 1.5, paddingLeft: 16 }}>
                                                        <Text style={styles.cellText}>{item.guardName}</Text>
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.cellText, { color: theme.colors.slate600 }]}>{formattedShift}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </>
                ) : type === 'All-Guards-Payout' ? (
                    renderAllGuardsPayoutReport()
                ) : (
                    renderGuardReport()
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
    backBtn: { padding: 4 },
    title: { fontSize: 18, fontWeight: 'bold' },
    subHeader: { padding: 16, backgroundColor: '#f9fafb' },
    subTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.slate800 },
    subDate: { fontSize: 14, color: theme.colors.slate500 },
    content: { flex: 1, padding: 16 },

    // Table Styles
    tableHeader: { flexDirection: 'row', backgroundColor: theme.colors.slate200, padding: 8, borderRadius: 4 },
    headerCell: { fontWeight: 'bold', fontSize: 12, color: theme.colors.slate700 },
    rowItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.colors.slate100 },
    cellText: { fontSize: 13, color: theme.colors.slate800 },
    noDataText: { textAlign: 'center', marginTop: 20, color: theme.colors.slate500, fontStyle: 'italic' },

    colDate: { flex: 2 },
    colLarge: { flex: 3 },
    colMedium: { flex: 2 },
    colTime: { flex: 1.5, textAlign: 'center' },
    colTimeRange: { flex: 2, textAlign: 'center' },

    // Guard Summary Styles
    guardContainer: {},
    summaryCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: theme.colors.primary },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { color: theme.colors.slate600 },
    summaryValue: { fontWeight: '600', color: theme.colors.slate900 },
    totalRow: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 8 },
    totalLabel: { fontWeight: 'bold', fontSize: 16 },
    totalValue: { fontWeight: 'bold', fontSize: 16, color: theme.colors.success },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
});
