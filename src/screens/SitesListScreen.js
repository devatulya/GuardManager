import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { getSites } from '../services/sites';

const SiteCard = ({ site, index, theme, styles }) => (
    <View style={styles.card}>
        <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
                <MaterialIcons name="location-on" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.siteName} numberOfLines={1}>{index}. {site.name}</Text>
                <Text style={styles.siteAddress} numberOfLines={1}>{site.address}</Text>
            </View>
        </View>
        <View style={styles.chevron}>
            <MaterialIcons name="chevron-right" size={28} color={theme.colors.text} />
        </View>
    </View>
);

export default function SitesListScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchSites = async () => {
        setLoading(true);
        try {
            const data = await getSites();
            // Automatically sort alphabetically if not already done by the query
            const sortedData = data.sort((a, b) => {
                const nameA = a.name || '';
                const nameB = b.name || '';
                return nameA.localeCompare(nameB);
            });
            setSites(sortedData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSites();
        }, [])
    );

    const filteredSites = sites.filter(site =>
        site.name.toLowerCase().includes(search.toLowerCase()) ||
        site.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ScreenWrapper edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <MaterialIcons name="menu" size={28} color={theme.colors.text} />
                    <Text style={styles.headerTitle}>Sites</Text>
                    <MaterialIcons name="account-circle" size={28} color={theme.colors.text} />
                </View>
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <MaterialIcons name="search" size={24} color={theme.colors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search sites..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>
            </View>

            <FlatList
                data={filteredSites}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => (
                    <Pressable onPress={() => navigation.navigate('AddSite', { site: item })}>
                        <SiteCard site={item} index={index + 1} theme={theme} styles={styles} />
                    </Pressable>
                )}
                contentContainerStyle={styles.listContent}
                refreshing={loading}
                onRefresh={fetchSites}
                ListEmptyComponent={!loading && <Text style={styles.emptyText}>No sites found</Text>}
            />

            <Pressable
                style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
                onPress={() => navigation.navigate('AddSite')}
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
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.s,
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
        paddingTop: theme.spacing.s,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.xl,
        height: 44,
        paddingHorizontal: theme.spacing.s,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.cardBackground,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.clayRaised,
        marginBottom: theme.spacing.s,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.m,
        backgroundColor: `${theme.colors.primary}1A`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    siteName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 2,
    },
    siteAddress: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    chevron: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
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
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
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
