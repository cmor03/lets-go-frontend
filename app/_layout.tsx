import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" />
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="events" options={{ title: 'Events' }} />
      <Stack.Screen name="create_event" options={{ title: 'Create Event' }} />
      <Stack.Screen name="events/[id]" options={{ title: 'Event Details' }} />
      {/* Add other screens as needed */}
    </Stack>
  );
}
