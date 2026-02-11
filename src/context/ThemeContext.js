import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, lightColors } from '../theme';

const ThemeContext = createContext({
    theme: { colors: lightColors },
    themeMode: 'system', // 'light' | 'dark' | 'system'
    isDark: false,
    setThemeMode: () => { },
});

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState('system');
    const [isArtificiallyDark, setIsArtificiallyDark] = useState(false);

    // load preference on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('user_theme_preference');
                if (storedTheme) {
                    setThemeModeState(storedTheme);
                }
            } catch (e) {
                console.warn("Failed to load theme preference", e);
            }
        };
        loadTheme();
    }, []);

    const setThemeMode = async (mode) => {
        setThemeModeState(mode);
        try {
            await AsyncStorage.setItem('user_theme_preference', mode);
        } catch (e) {
            console.warn("Failed to save theme preference", e);
        }
    };

    const isDark =
        themeMode === 'dark' ||
        (themeMode === 'system' && systemColorScheme === 'dark');

    const theme = getTheme(isDark ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
