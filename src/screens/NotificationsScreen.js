import Text from '../components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';

const MOCK_NOTIFICATIONS = [
    { id: '1', title: 'System Update', message: 'GuardManager v1.0.1 is live.', time: '2h ago', icon: 'system-update' },
    { id: '2', title: 'Attendance Alert', message: '3 guards absent at Westside Site.', time: '5h ago', icon: 'warning' },
    { id: '3', title: 'New Guard Added', message: 'John Doe was registered successfully.', time: '1d ago', icon: 'person-add' },
    { id: '4', title: 'Report Generated', message: 'Monthly report for Oct is ready.', time: '2d ago', icon: 'assignment' },
];

const NotificationItem = ({ item, theme, styles }) => (
    <View style={styles.item}>
        <View style={styles.iconContainer}>
            <MaterialIcons name={item.icon} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
        </View>
    </View>
);

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <ScreenWrapper edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>
            <FlatList
                data={MOCK_NOTIFICATIONS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <NotificationItem item={item} theme={theme} styles={styles} />}
                contentContainerStyle={styles.list}
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
        padding: theme.spacing.m,
        backgroundColor: theme.colors.headerBackground,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    list: {
        padding: theme.spacing.m,
    },
    item: {
        flexDirection: 'row',
        backgroundColor: theme.colors.cardBackground,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.s,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${theme.colors.primary}1A`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
});
