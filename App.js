import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            try {
                await Font.loadAsync({
                    // 'Inter_400Regular': require('./assets/fonts/Inter-Regular.ttf'), 
                    // 'Inter_700Bold': require('./assets/fonts/Inter-Bold.ttf'),
                    // For now we will rely on system fonts or assume they are loading if assets existed. 
                    // Since I haven't added the font files, I will comment this out to prevent crash.
                    // But I'll set fontsLoaded to true.
                });
            } catch (e) {
                console.warn(e);
            } finally {
                setFontsLoaded(true);
            }
        }
        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <StatusBar style="auto" />
                    <AppNavigator />
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
