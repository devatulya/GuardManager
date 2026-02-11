import { MaterialIcons } from '@expo/vector-icons';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

import { shareExcel, sharePDF } from '../services/reporting';
import { formatDate } from '../utils/date';

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
            <View style={styles.colTimeRange}><Text style={styles.cellText}>{item.startTime} - {item.endTime}</Text></View>
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
                    <Text style={[styles.headerCell, styles.colTime]}>In</Text>
                    <Text style={[styles.headerCell, styles.colTime]}>Out</Text>
                </View>
                {data.attendance.map((item, index) => (
                    <View key={index} style={styles.rowItem}>
                        <View style={styles.colDate}><Text style={styles.cellText}>{formatDate(item.date)}</Text></View>
                        <View style={styles.colLarge}><Text style={styles.cellText}>{item.siteName}</Text></View>
                        <View style={styles.colTime}><Text style={styles.cellText}>{item.startTime}</Text></View>
                        <View style={styles.colTime}><Text style={styles.cellText}>{item.endTime}</Text></View>
                    </View>
                ))}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
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
                {type === 'Site-wise' ? (
                    <>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCell, styles.colDate]}>Date</Text>
                            <Text style={[styles.headerCell, styles.colLarge]}>Guard</Text>
                            <Text style={[styles.headerCell, styles.colTime]}>In</Text>
                            <Text style={[styles.headerCell, styles.colTime]}>Out</Text>
                        </View>
                        <FlatList
                            data={data}
                            renderItem={renderSiteReportItem}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </>
                ) : type === 'Daily' ? (
                    <>
                        {data.length === 0 ? (
                            <Text style={styles.noDataText}>No attendance records found for this date.</Text>
                        ) : (
                            <>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.headerCell, styles.colLarge]}>Site Name</Text>
                                    <Text style={[styles.headerCell, styles.colMedium]}>Guard Name</Text>
                                    <Text style={[styles.headerCell, styles.colTimeRange]}>Time</Text>
                                </View>
                                <FlatList
                                    data={data}
                                    renderItem={renderDailyReportItem}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            </>
                        )}
                    </>
                ) : (
                    renderGuardReport()
                )}
            </View>
        </SafeAreaView>
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
