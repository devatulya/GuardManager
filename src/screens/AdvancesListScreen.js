import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchablePicker from '../components/SearchablePicker';
import { useTheme } from '../context/ThemeContext';
import { deleteAdvance, getAllAdvances } from '../services/advances';
import { getGuards } from '../services/guards';
import { formatDate } from '../utils/date';

export default function AdvancesListScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [guards, setGuards] = useState([]);
    const [advances, setAdvances] = useState([]);
    const [selectedGuardId, setSelectedGuardId] = useState('');
    const [loading, setLoading] = useState(true);

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
            const data = await getAllAdvances(selectedGuardId || null);
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
        }, [selectedGuardId])
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>All Advances</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by Guard:</Text>
                <SearchablePicker
                    items={[{ id: '', name: 'All Guards' }, ...guards]}
                    selectedValue={selectedGuardId}
                    onValueChange={setSelectedGuardId}
                    placeholder="Select Guard..."
                    theme={theme}
                />
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
