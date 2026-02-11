import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme as defaultTheme } from '../theme';

export default function SearchablePicker({ label, selectedValue, onValueChange, items, placeholder = "Select Item", theme = defaultTheme }) {
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState('');
    const styles = useMemo(() => getStyles(theme), [theme]);

    const selectedItem = items.find(i => i.id === selectedValue);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Pressable onPress={() => setVisible(true)} style={styles.pickerButton}>
                <Text style={selectedItem ? styles.pickerText : styles.pickerPlaceholder}>
                    {selectedItem ? selectedItem.name : placeholder}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.textSecondary} />
            </Pressable>

            <Modal visible={visible} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{placeholder}</Text>
                        <Pressable onPress={() => setVisible(false)}>
                            <MaterialIcons name="close" size={24} color={theme.colors.text} />
                        </Pressable>
                    </View>

                    <View style={styles.searchContainer}>
                        <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={search}
                            onChangeText={setSearch}
                            autoFocus
                        />
                    </View>

                    <FlatList
                        data={filteredItems}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.item}
                                onPress={() => {
                                    onValueChange(item.id);
                                    setVisible(false);
                                    setSearch('');
                                }}
                            >
                                <Text style={[styles.itemText, item.id === selectedValue && styles.selectedItemText]}>
                                    {item.name}
                                </Text>
                                {item.id === selectedValue && (
                                    <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                                )}
                            </Pressable>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>No matches found</Text>}
                    />
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: 0,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    pickerButton: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.l,
        paddingHorizontal: theme.spacing.m,
    },
    pickerText: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '500',
    },
    pickerPlaceholder: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.headerBackground,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    searchContainer: {
        margin: theme.spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: theme.spacing.m,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: theme.colors.text,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.cardBackground,
    },
    itemText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    selectedItemText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: theme.colors.textSecondary,
    },
});
