import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Events" }} />
      <Stack.Screen name="create_event" options={{ title: "Create Event" }} />
      <Stack.Screen name="[id]" options={{ title: "Event Details" }} />
      {/* Add other screens as needed */}
    </Stack>
  );
}
