import { router, Slot, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Loading from "./loading";

export default function RootLayout() {
  const paperTheme = MD3LightTheme;
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/events")
      } else {
        router.replace("/auth/(tabs)/")
      }
    }
  }, [user, loading])

  if (loading) {
    return <Loading />
  }

  return (
    <PaperProvider theme={paperTheme}>
      <Slot />
    </PaperProvider>
  );
}
