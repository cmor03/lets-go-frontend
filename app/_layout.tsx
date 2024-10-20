import {Stack} from 'expo-router';
import { useColorScheme } from 'react-native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from "react-native-paper";


export default function RootLayout() {
  const paperTheme = MD3LightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ title: 'Login/Signup', headerShown: false }} />
        <Stack.Screen name="events" options={{ title: 'Events' }} />
        <Stack.Screen name="create_event" options={{ title: 'Create Event' }} />
        <Stack.Screen name="events/[id]" options={{ title: 'Event Details' }} />
        {/* Add other screens as needed */}
      </Stack>
    </PaperProvider>
  );
}
