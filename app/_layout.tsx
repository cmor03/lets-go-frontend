import { Slot } from "expo-router";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import AuthProvider from "./AuthProvider";

export default function RootLayout() {
  const paperTheme = MD3LightTheme;

  return (
    <AuthProvider>
      <PaperProvider theme={paperTheme}>
        <Slot />
      </PaperProvider>
    </AuthProvider>
  );
}
