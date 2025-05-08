import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import TableScreen from "./TableScreen";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";

const Tab = createMaterialTopTabNavigator();

const PendingScreen = () => <TableScreen status="Pending" />;
const AssignedScreen = () => <TableScreen status="Assigned" />;
const CheckedScreen = () => <TableScreen status="Checked" />;
const RePaymentScreen = () => <TableScreen status="PendingDepositPayment" />;
const ApprovedScreen = () => <TableScreen status="Approved" />;
const RejectedScreen = () => <TableScreen status="Rejected" />;
const AcceptedScreen = () => <TableScreen status="Accepted" />;
const CompletedScreen = () => <TableScreen status="Completed" />;
const CancelledScreen = () => <TableScreen status="Cancelled" />;

const ConsignmentTabs = () => {
  return (
    <Tab.Navigator
      style={{ flex: 1 }}
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "red" },
        tabBarActiveTintColor: "red",
        tabBarInactiveTintColor: "gray",
        tabBarScrollEnabled: true,
        tabBarStyle: { elevation: 0 },
      }}
    >
      <Tab.Screen name="Pending" component={PendingScreen} />
      <Tab.Screen name="Assigned" component={AssignedScreen} />
      <Tab.Screen name="Checked" component={CheckedScreen} />
      <Tab.Screen name="Approved" component={ApprovedScreen} />
      <Tab.Screen name="Rejected" component={RejectedScreen} />
      <Tab.Screen name="Accepted" component={AcceptedScreen} />
      <Tab.Screen name="Completed" component={CompletedScreen} />
      <Tab.Screen name="Re-Payment" component={RePaymentScreen} />
      <Tab.Screen name="Cancelled" component={CancelledScreen} />
    </Tab.Navigator>
  );
};

const ConsignmentList = ({ navigation }: any) => {
  const router = useRouter();
  const handleBack = () => {
    router.push(`/(tabs)/consignment`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          width: "80%",
          alignSelf: "center",
          marginTop: 32,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={handleBack}
          className="p-2 rounded-full bg-gray-200"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>

        <View className="ml-4">
          <Text style={{ fontWeight: "bold", fontSize: 24 }}>
            Consignment List
          </Text>
          <Text style={{ color: "gray", marginBottom: 16 }}>
            Used for shipping orders
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ConsignmentTabs />
      </View>
    </SafeAreaView>
  );
};

export default ConsignmentList;
