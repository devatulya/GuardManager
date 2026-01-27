import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { formatDate } from '../utils/date';

export default function DateTimePickerField({ label, value, onChange, mode = 'time', displayValue }) {
    const [show, setShow] = useState(false);

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

const styles = StyleSheet.create({
    container: {
        marginBottom: 0,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.slate700,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.slate200,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        height: 56,
    },
    valueText: {
        fontSize: 16,
        color: theme.colors.slate900,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    iosPickerContainer: {
        backgroundColor: 'white',
        paddingBottom: 20,
    },
    iosHeader: {
        padding: 16,
        alignItems: 'flex-end',
        backgroundColor: '#f8f8f8',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    iosDone: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
