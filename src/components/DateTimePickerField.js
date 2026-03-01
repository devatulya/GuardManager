import Text from '../components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { theme as defaultTheme } from '../theme';
import { formatDate } from '../utils/date';

export default function DateTimePickerField({ label, value, onChange, mode = 'time', displayValue, theme = defaultTheme }) {
    const [show, setShow] = useState(false);
    const styles = useMemo(() => getStyles(theme), [theme]);

    // Helper to format display value
    const formatValue = (date) => {
        if (displayValue) return displayValue; // Use custom display value override
        if (mode === 'time') {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        // Use global DD/MM/YYYY format
        return formatDate(date);
    };

    // On Android, the picker opens as a dialog and returns immediately upon selection or cancel
    const handleChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }
        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Pressable onPress={() => setShow(true)} style={styles.inputContainer}>
                <Text style={styles.valueText}>{formatValue(value)}</Text>
                <MaterialIcons
                    name={mode === 'time' ? "access-time" : "calendar-today"}
                    size={24}
                    color={theme.colors.primary}
                />
            </Pressable>

            {show && (
                Platform.OS === 'ios' ? (
                    // iOS requires a modal or inline view
                    <Modal transparent animationType="slide" visible={show}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.iosPickerContainer}>
                                <View style={styles.iosHeader}>
                                    <Pressable onPress={() => setShow(false)}>
                                        <Text style={styles.iosDone}>Done</Text>
                                    </Pressable>
                                </View>
                                <DateTimePicker
                                    value={value}
                                    mode={mode}
                                    is24Hour={true}
                                    display="spinner"
                                    onChange={handleChange}
                                    style={{ width: '100%' }}
                                    themeVariant={theme.colors.backgroundDark === '#000000' || theme.colors.backgroundDark === '#020617' ? 'dark' : 'light'} // Basic check for dark mode
                                />
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={value}
                        mode={mode}
                        is24Hour={true}
                        display="default"
                        onChange={handleChange}
                    />
                )
            )}
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        height: 56,
    },
    valueText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    iosPickerContainer: {
        backgroundColor: theme.colors.cardBackground,
        paddingBottom: 20,
    },
    iosHeader: {
        padding: 16,
        alignItems: 'flex-end',
        backgroundColor: theme.colors.backgroundLight,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    iosDone: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
