import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { getGuards } from '../services/guards';

const GuardCard = ({ guard, theme, styles }) => (
    <View style={styles.card}>
        <View style={styles.cardContent}>
            <View style={styles.textColumn}>
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: guard.active ? theme.colors.success : theme.colors.textSecondary }]} />
                    <Text style={[styles.statusText, { color: guard.active ? theme.colors.success : theme.colors.textSecondary }]}>
                        {guard.active ? 'Active' : 'Inactive'}
                    </Text>
                </View>
                <Text style={styles.guardName}>{guard.name}</Text>
                <View style={styles.locationRow}>
                    <MaterialIcons name="location-on" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.guardLocation}>{guard.defaultSiteName || 'No Site Assigned'}</Text>
                </View>
            </View>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{guard.name.charAt(0)}</Text>
            </View>
        </View>
    </View>
);

export default function GuardsListScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [guards, setGuards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchGuards = async () => {
        setLoading(true);
        try {
            // In a real app we would join with Sites to get site names, or store siteName in guard.
            // For now we just get the guard data.
            const data = await getGuards();
            setGuards(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchGuards();
        }, [])
    );

    const filteredGuards = guards.filter(guard =>
        guard.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ScreenWrapper edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <MaterialIcons name="menu" size={28} color={theme.colors.text} />
                    <Text style={styles.headerTitle}>Guards</Text>
                    <MaterialIcons name="account-circle" size={28} color={theme.colors.text} />
                </View>
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <MaterialIcons name="search" size={24} color={theme.colors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search guards..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>
            </View>

            <FlatList
                data={filteredGuards}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Pressable onPress={() => navigation.navigate('AddGuard', { guard: item })}>
                        <GuardCard guard={item} theme={theme} styles={styles} />
                    </Pressable>
                )}
                contentContainerStyle={styles.listContent}
                refreshing={loading}
                onRefresh={fetchGuards}
                ListEmptyComponent={!loading && <Text style={styles.emptyText}>No guards found</Text>}
            />

            <Pressable
                style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
                onPress={() => navigation.navigate('AddGuard')}
            >
                <MaterialIcons name="add" size={30} color={theme.colors.white} />
            </Pressable>
        </ScreenWrapper>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        backgroundColor: theme.colors.headerBackground,
        paddingBottom: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    searchContainer: {
        paddingHorizontal: theme.spacing.m,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: theme.borderRadius.xl,
        height: 44,
        paddingHorizontal: theme.spacing.s,
    },
    searchIcon: {
        marginLeft: theme.spacing.s,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: theme.spacing.s,
        fontSize: 16,
        color: theme.colors.text,
    },
    listContent: {
        padding: theme.spacing.m,
        gap: theme.spacing.s,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: theme.colors.cardBackground,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.clayRaised,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textColumn: {
        flex: 1,
        gap: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    guardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    guardLocation: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabPressed: {
        transform: [{ scale: 0.95 }],
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xl,
    },
});
