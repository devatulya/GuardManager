import { MaterialIcons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdvancesListScreen from '../screens/AdvancesListScreen';
import AdvancesScreen from '../screens/AdvancesScreen';
import AttendanceReviewScreen from '../screens/AttendanceReviewScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreenReal from '../screens/SettingsScreen';
import { theme } from '../theme';
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

export default function MainNavigator() {
    const insets = useSafeAreaInsets();
    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={({ route }) => ({
                swipeEnabled: true,
                tabBarShowLabel: true,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.slate400,
                tabBarIndicatorStyle: {
                    backgroundColor: theme.colors.primary,
                    height: 3,
                    top: 0, // Indicator at top of the bottom bar
                },
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.slate100,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    height: 60 + insets.bottom, // Add bottom inset to height
                    paddingBottom: insets.bottom, // Add padding for home indicator
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    textTransform: 'none',
                    marginBottom: 4,
                },
                tabBarIcon: ({ color }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = 'dashboard';
                    else if (route.name === 'PayrollTab') iconName = 'account-balance-wallet';
                    else if (route.name === 'GuardsTab') iconName = 'groups';
                    else if (route.name === 'SitesTab') iconName = 'domain';
                    else if (route.name === 'ReportsTab') iconName = 'assignment';
                    // MaterialTopTabs passes 'color' but not 'size' by default in some versions,
                    // but we can hardcode size or rely on default.
                    return <MaterialIcons name={iconName} size={24} color={color} />;
                },
                // Material Top Tabs doesn't support 'headerShown' directly, 
                // but our screens are Stacks which handle their own headers or hide them.
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="PayrollTab"
                component={PayrollNavigator}
                options={{ title: 'Payroll' }}
            />
            <Tab.Screen
                name="GuardsTab"
                component={GuardsNavigator}
                options={{ title: 'Guards' }}
            />
            <Tab.Screen
                name="SitesTab"
                component={SitesNavigator}
                options={{ title: 'Sites' }}
            />
            <Tab.Screen
                name="ReportsTab"
                component={ReportsNavigator}
                options={{ title: 'Reports' }}
            />
        </Tab.Navigator>
    );
}
