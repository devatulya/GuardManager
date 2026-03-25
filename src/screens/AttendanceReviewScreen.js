import Text from '../components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { deleteAttendance, getAttendanceByDate } from '../services/attendance';

// Alternating site colors for visual differentiation
const SITE_COLORS = [
    { bg: '#dc262615', border: '#dc2626', text: '#dc2626', light: '#fef2f2' },  // Red
    { bg: '#2563eb15', border: '#2563eb', text: '#2563eb', light: '#eff6ff' },  // Blue
];

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
                return siteA.localeCompare(siteB) || ((a.shiftType === 'Night' ? 1 : 0) - (b.shiftType === 'Night' ? 1 : 0)) || (a.guardName || '').localeCompare(b.guardName || '');
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

    // Build site color map for alternating colors
    const siteColorMap = useMemo(() => {
        const map = {};
        let siteIndex = 0;
        attendanceList.forEach(item => {
            const siteName = (item.siteName || 'Unknown Site').toLowerCase();
            if (!(siteName in map)) {
                map[siteName] = SITE_COLORS[siteIndex % 2];
                siteIndex++;
            }
        });
        return map;
    }, [attendanceList]);

    // Group items by site for section rendering
    const groupedData = useMemo(() => {
        const result = [];
        let lastSite = null;
        attendanceList.forEach(item => {
            const siteName = (item.siteName || 'Unknown Site').toLowerCase();
            if (siteName !== lastSite) {
                result.push({ type: 'header', siteName: item.siteName || 'Unknown Site', key: `header-${siteName}` });
                lastSite = siteName;
            }
            result.push({ type: 'item', ...item, key: item.id });
        });
        return result;
    }, [attendanceList]);

    const renderGroupedItem = ({ item }) => {
        if (item.type === 'header') {
            const siteColor = siteColorMap[(item.siteName || 'Unknown Site').toLowerCase()];
            return (
                <View style={[
                    styles.siteGroupHeader,
                    { backgroundColor: siteColor.bg, borderLeftColor: siteColor.border }
                ]}>
                    <MaterialIcons name="location-on" size={18} color={siteColor.text} />
                    <Text style={[styles.siteGroupHeaderText, { color: siteColor.text }]}>
                        {item.siteName}
                    </Text>
                </View>
            );
        }

        const isSelected = selectedIds.has(item.id);
        const siteColor = siteColorMap[(item.siteName || 'Unknown Site').toLowerCase()];
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    { borderLeftWidth: 3, borderLeftColor: siteColor.border },
                    pressed && styles.cardPressed,
                    isSelected && [styles.cardSelected, { borderColor: siteColor.border }]
                ]}
                onLongPress={() => handleLongPress(item.id)}
                onPress={() => handlePress(item)}
                delayLongPress={300}
            >
                <View style={styles.cardRow}>
                    {isSelectionMode && (
                        <MaterialIcons
                            name={isSelected ? "check-circle" : "radio-button-unchecked"}
                            size={20}
                            color={isSelected ? siteColor.text : theme.colors.slate300}
                            style={{ marginRight: 10 }}
                        />
                    )}
                    <Text style={styles.guardName} numberOfLines={1}>{item.guardName}</Text>
                    <View style={[styles.siteBadge, { backgroundColor: siteColor.bg }]}>
                        <Text style={[styles.siteText, { color: siteColor.text }]}>{item.siteName || 'Unknown Site'}</Text>
                    </View>
                    <View style={styles.shiftBadge}>
                        <MaterialIcons
                            name={item.shiftType === 'Night' ? 'nights-stay' : 'wb-sunny'}
                            size={14}
                            color={item.shiftType === 'Night' ? '#3b82f6' : '#f59e0b'}
                        />
                        <Text style={styles.shiftText}>
                            {item.shiftType === 'Night' ? 'Night' : 'Day'}
                        </Text>
                    </View>
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
                data={groupedData}
                keyExtractor={item => item.key}
                renderItem={renderGroupedItem}
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
        gap: 6,
    },
    siteGroupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderRadius: 6,
    },
    siteGroupHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: theme.colors.cardBackground,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        elevation: 1,
    },
    cardPressed: {
        backgroundColor: theme.colors.backgroundLight,
    },
    cardSelected: {
        borderWidth: 1.5,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    guardName: {
        flex: 1,
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    siteBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    siteText: {
        fontSize: 11,
        fontWeight: '700',
    },
    shiftBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    shiftText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
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
