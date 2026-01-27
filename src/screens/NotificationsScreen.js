import { MaterialIcons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

const MOCK_NOTIFICATIONS = [
    { id: '1', title: 'System Update', message: 'GuardManager v1.0.1 is live.', time: '2h ago', icon: 'system-update' },
    { id: '2', title: 'Attendance Alert', message: '3 guards absent at Westside Site.', time: '5h ago', icon: 'warning' },
    { id: '3', title: 'New Guard Added', message: 'John Doe was registered successfully.', time: '1d ago', icon: 'person-add' },
    { id: '4', title: 'Report Generated', message: 'Monthly report for Oct is ready.', time: '2d ago', icon: 'assignment' },
];

const NotificationItem = ({ item }) => (
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
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>
            <FlatList
                data={MOCK_NOTIFICATIONS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <NotificationItem item={item} />}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.slate200,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.slate900,
    },
    list: {
        padding: theme.spacing.m,
    },
    item: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.slate100,
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
        color: theme.colors.slate900,
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
        color: theme.colors.slate600,
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        color: theme.colors.slate400,
    },
});
