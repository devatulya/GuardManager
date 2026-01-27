import { MaterialIcons } from '@expo/vector-icons'; // Using Expo vector icons which map to Material Symbols often
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSites } from '../services/sites';
import { theme } from '../theme';

// Helper for Material Symbols if needed, but MaterialIcons is standard in Expo
// Stitch uses "Material Symbols Outlined". MaterialIcons is close.

const SiteCard = ({ site }) => (
    <View style={styles.card}>
        <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
                <MaterialIcons name="location-on" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.siteName} numberOfLines={1}>{site.name}</Text>
                <Text style={styles.siteAddress} numberOfLines={1}>{site.address}</Text>
            </View>
        </View>
        <View style={styles.chevron}>
            <MaterialIcons name="chevron-right" size={28} color={theme.colors.slate900} />
        </View>
    </View>
);

export default function SitesListScreen({ navigation }) {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchSites = async () => {
        setLoading(true);
        try {
            const data = await getSites();
            setSites(data);
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <MaterialIcons name="menu" size={28} color={theme.colors.slate900} />
                    <Text style={styles.headerTitle}>Sites</Text>
                    <MaterialIcons name="account-circle" size={28} color={theme.colors.slate900} />
                </View>
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <MaterialIcons name="search" size={24} color={theme.colors.slate500} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search sites..."
                            placeholderTextColor={theme.colors.slate400} // or slate500 based on theme
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>
            </View>

            <FlatList
                data={filteredSites}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Pressable onPress={() => navigation.navigate('AddSite', { site: item })}>
                        <SiteCard site={item} />
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        backgroundColor: theme.colors.backgroundLight, // or slightly transparent if simulating blur
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.slate200,
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
        color: theme.colors.slate900,
    },
    searchContainer: {
        paddingHorizontal: theme.spacing.m,
        paddingTop: theme.spacing.s,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        height: 44, // h-11
        paddingHorizontal: theme.spacing.s,
        // shadow-sm logic (simplistic here)
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
        color: theme.colors.slate900,
    },
    listContent: {
        padding: theme.spacing.m,
        gap: theme.spacing.s,
        paddingBottom: 80, // Space for FAB
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.white,
        padding: theme.spacing.m, // px-4 py-3
        borderRadius: theme.borderRadius.l, // rounded-xl
        borderWidth: 1,
        borderColor: theme.colors.slate100, // gray-100
        // shadow-sm
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: theme.spacing.s, // space-y-3 equivalent
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m, // gap-4
        flex: 1,
    },
    iconContainer: {
        width: 48, // size-12
        height: 48,
        borderRadius: theme.borderRadius.m, // rounded-lg
        backgroundColor: `${theme.colors.primary}1A`, // primary/10 approx
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
        color: theme.colors.slate900,
        marginBottom: 2,
    },
    siteAddress: {
        fontSize: 14,
        color: theme.colors.slate500, // #616189
    },
    chevron: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24, // bottom-6
        right: 24, // right-6
        width: 56, // h-14 w-14
        height: 56,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        // shadow-lg
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
        color: theme.colors.slate500,
        marginTop: theme.spacing.xl,
    },
});
