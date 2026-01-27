import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from '../screens/SignupScreen';
import SplashScreen from '../screens/SplashScreen';
import VerificationScreen from '../screens/VerificationScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
        </Stack.Navigator>
    );
}
