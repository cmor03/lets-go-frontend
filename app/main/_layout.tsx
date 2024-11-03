import { Redirect, Stack } from "expo-router";
import { useSession } from "../AuthProvider";
import Loading from "../loading";

export default function StackLayout() {

  const {user, loading, error} = useSession();

  if (loading)
    return <Loading />
  
  if (!user)
    return <Redirect href="/(tabs)/" />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Events" }} />
      <Stack.Screen name="events/create_event" options={{ title: "Create Event" }} />
      <Stack.Screen name="events/[id]" options={{ title: "Event Details" }} />
    </Stack>
  );
}
