import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ title: "Tabbed Layout", headerShown: false}} />
            <Stack.Screen name="forgot_password" options={{ title: "Forgot Password" }} />
        </Stack>
    )
}