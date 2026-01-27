import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GuardsListScreen from '../screens/GuardsListScreen';
import AddGuardScreen from '../screens/AddGuardScreen';

const Stack = createStackNavigator();

export default function GuardsNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GuardsList" component={GuardsListScreen} />
            <Stack.Screen name="AddGuard" component={AddGuardScreen} />
        </Stack.Navigator>
    );
}
