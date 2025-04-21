import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.replace("/(tabs)/home");
          return;
        }

        const parsedData = JSON.parse(userData);
        const role = parsedData?.role;

        if (role === "SHIPPER") {
          router.replace("/(delivery)/DeliveryList");
        } else {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.error("Failed to get user data:", error);
        router.replace("/(auth)/LoginScreen");
      }
    };

    checkRoleAndRedirect();
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#FF6600" />
    </View>
  );
}
