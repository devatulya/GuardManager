import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { user, profile, loading } = useAuth();
    const { theme, isDark } = useTheme();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.backgroundLight }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const navigationTheme = isDark ? DarkTheme : DefaultTheme;

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    profile ? (
                        <Stack.Screen name="Main" component={MainNavigator} />
                    ) : (
                        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                    )
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
