import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import DeliveryItem from "@/components/DeliveryItem";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createMaterialTopTabNavigator();

const AssignedScreen = () => <DeliveryItem status="Assigned" />;
const DeliveringScreen = () => <DeliveryItem status="Delivering" />;
const DeliveredScreen = () => <DeliveryItem status="Delivered" />;
const DeliveryFailedScreen = () => <DeliveryItem status="DeliveryFailed" />;
const RejectedScreen = () => <DeliveryItem status="Rejected" />;

const DeliveryTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "red" },
        tabBarActiveTintColor: "red",
        tabBarInactiveTintColor: "gray",
        tabBarScrollEnabled: true,
      }}
    >
      <Tab.Screen name="Assigned" component={AssignedScreen} />
      <Tab.Screen name="Delivering" component={DeliveringScreen} />
      <Tab.Screen name="Delivered" component={DeliveredScreen} />
      <Tab.Screen name="Delivery Failed" component={DeliveryFailedScreen} />
      <Tab.Screen name="Rejected" component={RejectedScreen} />
    </Tab.Navigator>
  );
};

export default function DeliveryList() {
  const router = useRouter();
  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userData");
          router.replace("(auth)/LoginScreen");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row justify-between items-center p-5 bg-white shadow-md">
        <Text className="text-2xl font-bold">Delivery List</Text>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#f87171" />
        </TouchableOpacity>
      </View>
      <DeliveryTabs />
    </View>
  );
}
