import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import InvoiceStatusScreen from "@/components/InvoiceStatusScreen";

const Tab = createMaterialTopTabNavigator();

// Tab Screen Components
const InvoiceCreatedScreen = () => (
  <InvoiceStatusScreen status="PendingPayment" />
);
const PaidScreen = () => <InvoiceStatusScreen status="Paid" />;

// Main Component
export default function InvoiceList() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center p-3 bg-white shadow-md">
        <TouchableOpacity
          onPress={() => router.push(`(tabs)/profile`)}
          className="p-2 rounded-full bg-gray-100"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-bold">Invoice List</Text>
      </View>

      {/* Tab Navigator */}
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
          tabBarIndicatorStyle: { backgroundColor: "#FFBA00" },
          tabBarActiveTintColor: "#FFBA00",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: { backgroundColor: "#F3F4F6" },
          tabBarPressColor: "#F3F4F6",
        }}
      >
        <Tab.Screen
          name="InvoiceCreated"
          component={InvoiceCreatedScreen}
          options={{ tabBarLabel: "PendingPayment" }}
        />
        <Tab.Screen
          name="Paid"
          component={PaidScreen}
          options={{ tabBarLabel: "Paid" }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
