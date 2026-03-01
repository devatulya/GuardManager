import Text from '../components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { deleteAttendance, getAttendanceByDate } from '../services/attendance';

const formatDateHeader = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function AttendanceReviewScreen({ route, navigation }) {
    const { date } = route.params;
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const data = await getAttendanceByDate(date);
            // Sort by Site Name Alphabetically
            const sortedData = data.sort((a, b) => {
                const siteA = a.siteName || '';
                const siteB = b.siteName || '';
                return siteA.localeCompare(siteB);
            });
            setAttendanceList(sortedData);
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
            return () => {
                setIsSelectionMode(false);
                setSelectedIds(new Set());
            };
        }, [])
    );

    const toggleSelection = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);

        if (newSelected.size === 0) {
            setIsSelectionMode(false);
        }
    };

    const handleLongPress = (id) => {
        setIsSelectionMode(true);
        toggleSelection(id);
    };

    const handlePress = (item) => {
        if (isSelectionMode) {
            toggleSelection(item.id);
        } else {
            // Optional: View details or do nothing
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.size === attendanceList.length) {
            setSelectedIds(new Set());
            setIsSelectionMode(false);
        } else {
            const allIds = new Set(attendanceList.map(item => item.id));
            setSelectedIds(allIds);
            setIsSelectionMode(true);
        }
    };

    const handleBulkDelete = () => {
        Alert.alert(
            'Delete Selected?',
            `Are you sure you want to delete ${selectedIds.size} records?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const idsToDelete = Array.from(selectedIds);
                            await Promise.all(idsToDelete.map(id => deleteAttendance(id)));

                            // Optimistic update or refetch
                            setAttendanceList(prev => prev.filter(item => !selectedIds.has(item.id)));
                            setIsSelectionMode(false);
                            setSelectedIds(new Set());
                            Alert.alert('Success', 'Records deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete some records');
                            fetchAttendance(); // Fallback
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedIds.has(item.id);
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                    isSelected && styles.cardSelected
                ]}
                onLongPress={() => handleLongPress(item.id)}
                onPress={() => handlePress(item)}
                delayLongPress={300}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.guardName}>{item.guardName}</Text>
                    {isSelected && <MaterialIcons name="check-circle" size={20} color={theme.colors.primary} />}
                    {!isSelected && isSelectionMode && <MaterialIcons name="radio-button-unchecked" size={20} color={theme.colors.slate300} />}
                </View>

                <View style={[styles.siteBadge, { alignSelf: 'flex-start', marginBottom: 8 }]}>
                    <Text style={styles.siteText}>{item.siteName || 'Unknown Site'}</Text>
                </View>

                <View style={styles.timeRow}>
                    <MaterialIcons
                        name={item.shiftType === 'Night' ? 'nights-stay' : 'wb-sunny'}
                        size={16}
                        color={theme.colors.slate500}
                    />
                    <Text style={styles.timeText}>
                        {item.shiftType === 'Night' ? 'Night Shift' : 'Day Shift'}
                    </Text>
                </View>
            </Pressable>
        );
    };

    return (
        <ScreenWrapper edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => {
                    if (isSelectionMode) {
                        setIsSelectionMode(false);
                        setSelectedIds(new Set());
                    } else {
                        navigation.goBack();
                    }
                }} style={styles.backButton}>
                    <MaterialIcons name={isSelectionMode ? "close" : "arrow-back-ios"} size={24} color={theme.colors.primary} />
                </Pressable>

                <Text style={styles.headerTitle}>
                    {isSelectionMode ? `${selectedIds.size} Selected` : `Attendance: ${formatDateHeader(date)}`}
                </Text>

                {isSelectionMode ? (
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <Pressable onPress={handleSelectAll}>
                            <MaterialIcons name="select-all" size={24} color={theme.colors.primary} />
                        </Pressable>
                        <Pressable onPress={handleBulkDelete}>
                            <MaterialIcons name="delete" size={24} color={theme.colors.danger} />
                        </Pressable>
                    </View>
                ) : (
                    <View style={{ width: 40 }} />
                )}
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
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
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
        backgroundColor: theme.colors.cardBackground,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardPressed: {
        backgroundColor: theme.colors.backgroundLight,
    },
    cardSelected: {
        backgroundColor: `${theme.colors.primary}1A`,
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
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
        color: theme.colors.text,
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
        color: theme.colors.textSecondary,
    },
    hintText: {
        fontSize: 10,
        color: theme.colors.textSecondary,
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
        color: theme.colors.textSecondary,
    },
});
