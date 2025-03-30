import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("(tabs)/home");
        }, 100);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <View className="flex items-center justify-center">
            <ActivityIndicator size="large" color="#FF6600" />
        </View>
    );
}
