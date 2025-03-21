import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import BrandHeader from "./BrandHeader";
import TableScreen from "./TableScreen";

const Tab = createMaterialTopTabNavigator();

const PendingScreen = () => <TableScreen status="Pending" />;
const CheckedScreen = () => <TableScreen status="Checked" />;
const ApprovedScreen = () => <TableScreen status="Approved" />;
const RejectedScreen = () => <TableScreen status="Rejected" />;
const CancelledScreen = () => <TableScreen status="Cancelled" />;

const ConsignmentTabs = () => {
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
      <Tab.Screen name="Pending" component={PendingScreen} />
      {/* <Tab.Screen name="Checked" component={CheckedScreen} /> */}
      <Tab.Screen name="Approved" component={ApprovedScreen} />
      {/* <Tab.Screen name="Cancelled" component={CancelledScreen} /> */}
      <Tab.Screen name="Rejected" component={RejectedScreen} />
    </Tab.Navigator>
  );
};

const ConsignmentList = () => {
  return (
    <SafeAreaView className="w-full h-full bg-white flex-1">
      <BrandHeader />
      <View className="w-4/5 self-center mt-8">
        <Text className="font-bold text-3xl">Consignment List</Text>
        <Text className="font-light text-gray-500 mb-8">
          Used for shipping orders
        </Text>
      </View>
      <ConsignmentTabs />
    </SafeAreaView>
  );
};

export default ConsignmentList;