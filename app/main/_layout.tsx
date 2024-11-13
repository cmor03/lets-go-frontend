import { Redirect, Stack } from "expo-router";
import { useSession } from "../AuthProvider";
import Loading from "../loading";
import { IconButton } from "react-native-paper";
import { View } from "react-native";
import styles from "../styles";

export default function StackLayout() {

  const {user, loading, error} = useSession();

  if (loading)
    return <Loading />
  
  if (!user)
    return <Redirect href="/auth/(tabs)/" />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Events" }} />
      <Stack.Screen name="events/create_event" options={{ title: "Create Event" }} />
      <Stack.Screen name="events/[id]" options={{ title: "Event Details",
        headerRight: () => <View style={styles.flexRowHeader}>
            <IconButton icon="pencil" onPress={() => null}/>
            <IconButton icon="share-variant" onPress={() => null}/>
          </View>,
       }} />
    </Stack>
  );
}
