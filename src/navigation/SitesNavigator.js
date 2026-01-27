import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SitesListScreen from '../screens/SitesListScreen';
import AddSiteScreen from '../screens/AddSiteScreen';

const Stack = createStackNavigator();

export default function SitesNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SitesList" component={SitesListScreen} />
            <Stack.Screen name="AddSite" component={AddSiteScreen} />
        </Stack.Navigator>
    );
}
