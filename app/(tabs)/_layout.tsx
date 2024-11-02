import { Tabs } from 'expo-router';
import { Icon, useTheme, BottomNavigation } from 'react-native-paper';

export default function TabLayout() {
  const theme = useTheme();

  const fontObject = {
    fontFamily: theme.fonts.default.fontFamily,
    fontWeight: theme.fonts.default.fontWeight
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.colors.primary}}>
        <Tabs.Screen
            name="index"
            options={{
                title: "Login",
                tabBarIcon: ({color, size}) => <Icon source="login" size={size} color={color}/>,
                tabBarLabelStyle: fontObject
            }}
        />
        <Tabs.Screen
            name="signup"
            options={{
                title: "Register",
                tabBarIcon: ({color, size}) => <Icon source="account-plus" size={size} color={color}/>,
                tabBarLabelStyle: fontObject
            }}
        />
    </Tabs>
  );
}
