import { MaterialIcons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import AdvancesListScreen from '../screens/AdvancesListScreen';
import AdvancesScreen from '../screens/AdvancesScreen';
import AttendanceReviewScreen from '../screens/AttendanceReviewScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreenReal from '../screens/SettingsScreen';
import GuardsNavigator from './GuardsNavigator';
import ReportsNavigator from './ReportsNavigator';
import SitesNavigator from './SitesNavigator';

const HomeStack = createStackNavigator();
function HomeNavigator() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Attendance" component={AttendanceScreen} />
            <HomeStack.Screen name="AttendanceReview" component={AttendanceReviewScreen} />
            <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
            <HomeStack.Screen name="Settings" component={SettingsScreenReal} />
        </HomeStack.Navigator>
    );
}

const PayrollStack = createStackNavigator();
function PayrollNavigator() {
    return (
        <PayrollStack.Navigator screenOptions={{ headerShown: false }}>
            <PayrollStack.Screen name="Advances" component={AdvancesScreen} />
            <PayrollStack.Screen name="AdvancesList" component={AdvancesListScreen} />
            <PayrollStack.Screen name="Notifications" component={NotificationsScreen} />
        </PayrollStack.Navigator>
    );
}

const Tab = createMaterialTopTabNavigator();

const TAB_ICONS = {
    Home: 'dashboard',
    PayrollTab: 'account-balance-wallet',
    GuardsTab: 'groups',
    SitesTab: 'domain',
    ReportsTab: 'assignment',
};

const TAB_LABELS = {
    Home: 'Home',
    PayrollTab: 'Payroll',
    GuardsTab: 'Guards',
    SitesTab: 'Sites',
    ReportsTab: 'Reports',
};

export default function MainNavigator() {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();

    const TAB_BAR_HEIGHT = 64;
    const TOTAL_HEIGHT = TAB_BAR_HEIGHT + insets.bottom;

    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={({ route }) => ({
                swipeEnabled: true,
                tabBarShowLabel: true,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                // Hide default sliding indicator — active state shown via icon/label color
                tabBarIndicatorStyle: { height: 0 },
                tabBarStyle: {
                    backgroundColor: theme.colors.surfaceSolid,
                    borderTopWidth: 0,
                    height: TOTAL_HEIGHT,
                    paddingBottom: insets.bottom,
                    // Clay upward shadow
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: isDark ? 0.4 : 0.10,
                    shadowRadius: 16,
                    elevation: 16,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    textTransform: 'none',
                    marginTop: -2,
                    marginBottom: 2,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
                tabBarIcon: ({ focused }) => {
                    const iconName = TAB_ICONS[route.name] || 'circle';
                    return (
                        <MaterialIcons
                            name={iconName}
                            size={24}
                            color={focused ? theme.colors.primary : theme.colors.textSecondary}
                        />
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeNavigator} options={{ title: TAB_LABELS.Home }} />
            <Tab.Screen name="PayrollTab" component={PayrollNavigator} options={{ title: TAB_LABELS.PayrollTab }} />
            <Tab.Screen name="GuardsTab" component={GuardsNavigator} options={{ title: TAB_LABELS.GuardsTab }} />
            <Tab.Screen name="SitesTab" component={SitesNavigator} options={{ title: TAB_LABELS.SitesTab }} />
            <Tab.Screen name="ReportsTab" component={ReportsNavigator} options={{ title: TAB_LABELS.ReportsTab }} />
        </Tab.Navigator>
    );
}
