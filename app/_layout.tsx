import Toast from "react-native-toast-message";
import "../global.css";
import { Stack, useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(components)" options={{ headerShown: false }} />
        <Stack.Screen name="(delivery)" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
}
