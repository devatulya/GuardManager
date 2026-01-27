import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ReportsScreen from '../screens/ReportsScreen';
import ReportResultsScreen from '../screens/ReportResultsScreen';

const Stack = createStackNavigator();

export default function ReportsNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ReportsSelect" component={ReportsScreen} />
            <Stack.Screen name="ReportResults" component={ReportResultsScreen} />
        </Stack.Navigator>
    );
}
