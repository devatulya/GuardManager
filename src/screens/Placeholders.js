import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ name }) => (
    <View style={styles.container}>
        <Text>{name}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export const AttendanceScreen = () => <PlaceholderScreen name="Attendance (Home)" />;
export const GuardsListScreen = () => <PlaceholderScreen name="Guards List" />;
export const SitesListScreen = () => <PlaceholderScreen name="Sites List" />;
export const ReportsScreen = () => <PlaceholderScreen name="Reports" />;
export const SettingsScreen = () => <PlaceholderScreen name="Settings" />;
