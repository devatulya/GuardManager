import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePickerField from '../components/DateTimePickerField';
import ScreenWrapper from '../components/ScreenWrapper';
import SearchablePicker from '../components/SearchablePicker';
import { useTheme } from '../context/ThemeContext';
import { deleteAdvance, getAllAdvances } from '../services/advances';
import { getGuards } from '../services/guards';
import { shareAdvancesPDF } from '../services/reporting';
import { formatDate } from '../utils/date';

export default function AdvancesListScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [guards, setGuards] = useState([]);
    const [advances, setAdvances] = useState([]);
    const [selectedGuardId, setSelectedGuardId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);

    // Derived Total
    const totalAdvances = useMemo(() => {
        return advances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }, [advances]);

    const fetchGuards = async () => {
        try {
            const data = await getGuards();
            // Add "All Guards" option nicely or handle it in UI logic? 
            // SearchablePicker takes items array. We can keep it clean and use explicit UI for "All".
            // Or better, add a dummy item? No, let's just use the picker's clear or default state.
            // But SearchablePicker likely assumes objects.
            setGuards(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAdvances = async () => {
        setLoading(true);
        try {
            const year = selectedMonth.getFullYear();
            const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
            const monthStr = `${year}-${month}`;

            const data = await getAllAdvances(selectedGuardId || null, monthStr);
            setAdvances(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchGuards();
            fetchAdvances();
        }, [selectedGuardId, selectedMonth])
    );

    const handleDelete = (item) => {
        Alert.alert(
            'Delete Record?',
            `Are you sure you want to delete the advance for ${item.guardName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAdvance(item.id);
                            fetchAdvances(); // Refresh list
                            Alert.alert('Success', 'Record deleted');
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        if (advances.length === 0) {
            Alert.alert('No Data', 'There are no advances to share for this month.');
            return;
        }

        setSharing(true);
        try {
            const year = selectedMonth.getFullYear();
            const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
            const monthStr = `${year}-${month}`;

            await shareAdvancesPDF(advances, totalAdvances, monthStr);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF.');
        } finally {
            setSharing(false);
        }
    };

    const renderItem = ({ item }) => {
        const initials = item.guardName ? item.guardName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onLongPress={() => handleDelete(item)}
                delayLongPress={500}
            >
                <View style={styles.cardLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>{item.guardName}</Text>
                        <Text style={styles.cardSubtitle}>{formatDate(item.date)}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    <Text style={styles.amountText}>-₹{Number(item.amount).toFixed(2)}</Text>
                    <Text style={styles.typeText}>PAYROLL DEDUCT</Text>
                </View>
                <Text style={styles.hintText}>Long press to delete</Text>
            </Pressable>
        );
    };

    return (
        <ScreenWrapper edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>All Advances</Text>

                <Pressable onPress={handleShare} disabled={sharing} style={styles.shareButton}>
                    {sharing ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <MaterialIcons name="ios-share" size={24} color={theme.colors.primary} />
                    )}
                </Pressable>
            </View>

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by Guard:</Text>
                <View style={{ marginBottom: 12 }}>
                    <SearchablePicker
                        items={[{ id: '', name: 'All Guards' }, ...guards]}
                        selectedValue={selectedGuardId}
                        onValueChange={setSelectedGuardId}
                        placeholder="Select Guard..."
                        theme={theme}
                    />
                </View>

                <Text style={styles.filterLabel}>Select Month:</Text>
                <DateTimePickerField
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    mode="date"
                    theme={theme}
                />
            </View>

            <View style={{ paddingHorizontal: theme.spacing.m, paddingTop: theme.spacing.m }}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Advances For {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                    <Text style={styles.summaryValue}>₹{totalAdvances.toFixed(2)}</Text>
                </View>
            </View>

            <FlatList
                data={advances}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshing={loading}
                onRefresh={fetchAdvances}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No records found.</Text>
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
    shareButton: {
        padding: theme.spacing.s,
        marginRight: -theme.spacing.s,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.headerBackground,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        zIndex: 10,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    summaryCard: {
        backgroundColor: theme.colors.primary,
        padding: 20,
        borderRadius: theme.borderRadius.xl,
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
    },
    listContent: {
        padding: theme.spacing.m,
        paddingBottom: 24,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        padding: 16,
        marginBottom: 12,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.clayRaised,
    },
    cardPressed: {
        backgroundColor: theme.colors.backgroundLight,
    },
    hintText: {
        position: 'absolute',
        bottom: 4,
        right: 8,
        fontSize: 8,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${theme.colors.primary}1A`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    cardSubtitle: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.danger,
    },
    typeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.textSecondary,
    },
});
