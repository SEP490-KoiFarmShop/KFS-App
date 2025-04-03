import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderTable from './OrderTable';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';


const Tab = createMaterialTopTabNavigator();

const ProcessingScreen = () => <OrderTable status="Processing" />;
const PendingPaymentScreen = () => <OrderTable status="PendingPayment" />;
const CancelledScreen = () => <OrderTable status="Cancelled" />;

const OrderTabs = () => {
    const params = useLocalSearchParams();
    const orderStatus = Array.isArray(params.orderStatus) ? params.orderStatus[0] : params.orderStatus;

    return (
        <Tab.Navigator
            initialRouteName={orderStatus ?? "Processing"}
            screenOptions={{
                tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
                tabBarIndicatorStyle: { backgroundColor: "red" },
                tabBarActiveTintColor: "red",
                tabBarInactiveTintColor: "gray",
                tabBarScrollEnabled: true,
            }}
        >
            <Tab.Screen name="Processing" component={ProcessingScreen} />
            <Tab.Screen name="Pending Payment" component={PendingPaymentScreen} />
            <Tab.Screen name="Cancelled" component={CancelledScreen} />
        </Tab.Navigator>
    );
};

export default function OrderHome() {
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
                <View className='ml-4'>
                    <Text className="font-bold text-3xl text-gray-900">Order List</Text>
                    <Text className="font-light text-gray-500">
                        Used for shipping orders
                    </Text>
                </View>
            </View>
            <OrderTabs />
        </SafeAreaView>
    )
}