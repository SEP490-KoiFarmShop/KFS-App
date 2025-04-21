import GlobalProvider from "@/context/GlobalProvider";
import "../global.css";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function App() {
  const router = useRouter();
  // useEffect(() => {
  //   const checkUser = async () => {
  //     const userData = await AsyncStorage.getItem("userData");
  //     if (!userData) {
  //       router.push("/(auth)/LoginScreen");
  //       return;
  //     }

  //     const parsedToken = JSON.parse(userData);
  //     const role = parsedToken?.role;

  //     if (role === "SHIPPER") {
  //       router.push("/(delivery)/DeliveryList");
  //       return;
  //     }
  //   };

  //   checkUser();
  // }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(components)" options={{ headerShown: false }} />
      <Stack.Screen name="(delivery)" options={{ headerShown: false }} />
    </Stack>
  );
}
