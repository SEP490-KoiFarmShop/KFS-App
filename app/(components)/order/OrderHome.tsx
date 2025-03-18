import { View, Text } from 'react-native'
import React from 'react'
import BrandHeader from '../consignment/BrandHeader'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import TableScreen from '../consignment/TableScreen';
import OrderTable from './OrderTable';

const Tab = createMaterialTopTabNavigator();

const PendingScreen = () => <OrderTable status="Pending" />;
const PendingPaymentScreen = () => <OrderTable status="PendingPayment" />;
const CancelledScreen = () => <OrderTable status="Cancelled" />;

const OrderTabs = () => {
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
            <Tab.Screen name="Pending Payment" component={PendingPaymentScreen} />
            <Tab.Screen name="Cancelled" component={CancelledScreen} />
        </Tab.Navigator>
    );
};

export default function OrderHome() {
    return (
        <SafeAreaView className="w-full h-full bg-white flex-1">
            <BrandHeader />
            <View className="w-4/5 self-center mt-8">
                <Text className="font-bold text-3xl">Order List</Text>
                <Text className="font-light text-gray-500 mb-8">
                    Used for shipping orders
                </Text>
            </View>
            <OrderTabs />
        </SafeAreaView>
    )
}