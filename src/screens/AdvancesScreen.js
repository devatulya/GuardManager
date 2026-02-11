import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerField from '../components/DateTimePickerField';
import SearchablePicker from '../components/SearchablePicker';
import { useTheme } from '../context/ThemeContext';
import { addAdvance, getRecentAdvances } from '../services/advances';
import { getGuards } from '../services/guards';
import { formatDate } from '../utils/date';

export default function AdvancesScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [guards, setGuards] = useState([]);
    const [advances, setAdvances] = useState([]);

    // Form State
    const [selectedGuardId, setSelectedGuardId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());

    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(true);

    const fetchData = async () => {
        try {
            const guardsData = await getGuards();
            setGuards(guardsData);
            await fetchRecentAdvances();
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingList(false);
        }
    };

    const fetchRecentAdvances = async () => {
        const data = await getRecentAdvances(10);
        setAdvances(data);
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const handleSave = async () => {
        if (!selectedGuardId) {
            Alert.alert('Error', 'Please select a guard');
            return;
        }
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const guard = guards.find(g => g.id === selectedGuardId);

            // Format date YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            await addAdvance({
                guardId: selectedGuardId,
                guardName: guard?.name || 'Unknown',
                amount: Number(amount),
                date: dateStr,
                type: 'payroll_deduct', // Defaulting to payroll deduct as per UI
                notes: 'Payroll Advance'
            });

            Alert.alert('Success', 'Advance recorded successfully');

            // Reset form
            setAmount('');
            setSelectedGuardId('');
            setDate(new Date());

            // Refresh list
            await fetchRecentAdvances();

        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const initials = item.guardName ? item.guardName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

        return (
            <View style={styles.card}>
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
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Advance Payments</Text>
                <Pressable onPress={() => navigation.navigate('Notifications')} style={styles.notificationIcon}>
                    <MaterialIcons name="notifications" size={24} color={theme.colors.primary} />
                    <View style={styles.badge} />
                </Pressable>
            </View>

            <FlatList
                data={advances}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.content}
                ListHeaderComponent={
                    <View style={styles.heroContainer}>
                        <View style={styles.heroCard}>
                            <LinearGradient
                                colors={[`${theme.colors.primary}33`, `${theme.colors.primary}00`]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroBanner}
                            >
                                <MaterialIcons name="payments" size={40} color={theme.colors.primary} />
                                <Text style={styles.heroTitle}>Payroll Advances</Text>
                            </LinearGradient>

                            <View style={styles.formContainer}>
                                <Text style={styles.formDesc}>Enter details to deduct from the next payroll cycle for security personnel.</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Select Security Guard</Text>
                                    <View style={styles.pickerWrapper}>
                                        <SearchablePicker
                                            items={guards}
                                            selectedValue={selectedGuardId}
                                            onValueChange={setSelectedGuardId}
                                            placeholder="Search guard name or ID"
                                            theme={theme}
                                        />
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Amount</Text>
                                        <View style={styles.amountInputWrapper}>
                                            <Text style={styles.currencySymbol}>₹</Text>
                                            <TextInput
                                                style={styles.amountInput}
                                                placeholder="0.00"
                                                keyboardType="numeric"
                                                value={amount}
                                                onChangeText={setAmount}
                                            />
                                        </View>
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                                        <Text style={styles.label}>Date</Text>
                                        <DateTimePickerField
                                            value={date}
                                            onChange={setDate}
                                            mode="date"
                                            theme={theme}
                                        />
                                    </View>
                                </View>

                                <Pressable
                                    style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
                                    onPress={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <MaterialIcons name="add-circle" size={20} color="white" style={{ marginRight: 8 }} />
                                            <Text style={styles.saveButtonText}>Record Advance</Text>
                                        </>
                                    )}
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.listHeader}>
                            <Text style={styles.listTitle}>Recent Advances</Text>
                            <Pressable onPress={() => navigation.navigate('AdvancesList')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </Pressable>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    !loadingList && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No recent advances found.</Text>
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
    notificationIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.danger,
        borderWidth: 1,
        borderColor: 'white',
    },
    content: {
        paddingBottom: 24,
    },
    heroContainer: {
        padding: theme.spacing.m,
    },
    heroCard: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    heroBanner: {
        height: 128,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    formContainer: {
        padding: theme.spacing.m,
        gap: 16,
    },
    formDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 6,
    },
    pickerWrapper: {
        backgroundColor: theme.colors.cardBackground,
    },
    row: {
        flexDirection: 'row',
    },
    amountInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.l,
        height: 56,
        paddingHorizontal: 12,
    },
    currencySymbol: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
        height: '100%',
    },
    inputGroup: {},
    saveButton: {
        backgroundColor: theme.colors.primary,
        height: 52,
        borderRadius: theme.borderRadius.l,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: theme.colors.primary,
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
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
