import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import InvoiceTable from "./InvoiceTable";

const Tab = createMaterialTopTabNavigator();

const PaidScreen = () => <InvoiceTable status="Paid" />;
// const PendingScreen = () => <InvoiceTable status="Pending" />;
const PendingPaymentScreen = () => <InvoiceTable status="PendingPayment" />;
const CancelledScreen = () => <InvoiceTable status="Cancelled" />;
const DeliveredScreen = () => <InvoiceTable status="Delivered" />;
const FinishedScreen = () => <InvoiceTable status="Finished" />;
const DeliveringScreen = () => <InvoiceTable status="Delivering" />;

const AuctionInvoiceTabs = () => {
  const params = useLocalSearchParams();
  const orderStatus = Array.isArray(params.orderStatus)
    ? params.orderStatus[0]
    : params.orderStatus;

  return (
    <Tab.Navigator
      initialRouteName={orderStatus ?? "Confirmed"}
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "red" },
        tabBarActiveTintColor: "red",
        tabBarInactiveTintColor: "gray",
        tabBarScrollEnabled: true,
      }}
    >
      <Tab.Screen name="Paid" component={PaidScreen} />
      {/* <Tab.Screen name="Confirmed" component={ConfirmedScreen} /> */}
      <Tab.Screen name="Delivering" component={DeliveringScreen} />
      <Tab.Screen name="Delivered" component={DeliveredScreen} />
      <Tab.Screen name="Finished" component={FinishedScreen} />
      <Tab.Screen name="Cancelled" component={CancelledScreen} />
      <Tab.Screen name="Pending Payment" component={PendingPaymentScreen} />
    </Tab.Navigator>
  );
};

export default function InvoiceHome() {
  const router = useRouter();

  return (
    <SafeAreaView className="w-full h-full bg-white flex-1">
      <View className="w-4/5 ml-3 mt-8 flex-row items-center space-x-4">
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/profile`)}
          className="p-2 rounded-full bg-gray-200 ml-1"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="font-bold text-3xl text-gray-900">
            Auction Invoice List
          </Text>
          <Text className="font-light text-gray-500">
            Used for shipping invoice and delivery invoice
          </Text>
        </View>
      </View>
      <AuctionInvoiceTabs />
    </SafeAreaView>
  );
}
