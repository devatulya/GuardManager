import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteAttendance, getAttendanceByDate } from '../services/attendance';
import { theme } from '../theme';

const formatDateHeader = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function AttendanceReviewScreen({ route, navigation }) {
    const { date } = route.params;
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const data = await getAttendanceByDate(date);
            setAttendanceList(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAttendance();
        }, [])
    );

    const handleDelete = (item) => {
        Alert.alert(
            'Delete Attendance?',
            `Are you sure you want to delete attendance for ${item.guardName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAttendance(item.id);
                            fetchAttendance(); // Refresh list
                            Alert.alert('Success', 'Attendance deleted');
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onLongPress={() => handleDelete(item)}
            delayLongPress={500}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.guardName}>{item.guardName}</Text>
                <View style={styles.siteBadge}>
                    <Text style={styles.siteText}>{item.siteName || 'Unknown Site'}</Text>
                </View>
            </View>
            <View style={styles.timeRow}>
                <MaterialIcons name="access-time" size={16} color={theme.colors.slate500} />
                <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
            </View>
            <Text style={styles.hintText}>Long press to delete</Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>Attendance: {formatDateHeader(date)}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={attendanceList}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshing={loading}
                onRefresh={fetchAttendance}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="event-busy" size={60} color={theme.colors.slate300} />
                            <Text style={styles.emptyText}>No attendance records found for this date.</Text>
                        </View>
                    )
                }
            />
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
    listContent: {
        padding: theme.spacing.m,
        gap: theme.spacing.m,
    },
    card: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.slate100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardPressed: {
        backgroundColor: theme.colors.slate50,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    guardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.slate900,
    },
    siteBadge: {
        backgroundColor: `${theme.colors.primary}1A`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    siteText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        fontSize: 14,
        color: theme.colors.slate600,
    },
    hintText: {
        fontSize: 10,
        color: theme.colors.slate400,
        marginTop: 8,
        textAlign: 'right',
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.colors.slate500,
    },
});
