import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Entypo from '@expo/vector-icons/Entypo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrderDetail() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const userData = await AsyncStorage.getItem("userData");
                if (!userData) {
                    router.push("/(auth)/LoginScreen");
                    return;
                }

                const parsedToken = JSON.parse(userData);
                const jwtToken = parsedToken?.accessToken;
                const response = await axios.get(
                    `https://kfsapis.azurewebsites.net/api/v1/orders/${orderId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                setOrder(response.data.data);
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ff0000" />
            </View>
        );
    }

    if (!order) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-gray-700">Không có dữ liệu đơn hàng</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1">
            <View className="w-full mb-2 flex-row items-center space-x-4 bg-white pb-3 pt-4">
                <TouchableOpacity
                    onPress={() => router.push(`/(tabs)/profile`)}
                    className="p-2 rounded-full bg-gray-200 ml-2"
                >
                    <Entypo name="chevron-thin-left" size={24} color="black" />
                </TouchableOpacity>
                <View className="ml-4">
                    <Text className="font-bold text-3xl text-gray-900">Order Detail</Text>
                    <Text className="font-light text-gray-500">Used for shipping orders</Text>
                </View>
            </View>

            <View className="bg-white m-3">
                <View className="bg-green-100 p-4 rounded-lg mb-4">
                    <Text className="text-green-600 font-bold">{order.status}</Text>
                </View>

                <View className="mt-3 ml-5 mb-3">
                    <Text className="text-gray-700 font-semibold">Delivery Information</Text>
                    <Text className="text-gray-600">{order.shippingAddress}</Text>
                    <View className="flex-row mt-2">
                        <MaterialCommunityIcons className='mt-3' name="truck-fast-outline" size={24} color="black" />
                        <View>
                            <Text className="mt-2 ml-3 text-green-600">{order.latestOrderTracking?.description || "Đang xử lý"}</Text>
                            <Text className="text-gray-600 ml-3">{new Date(order.createdAt).toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                <View className="border-b border-gray-300 my-4" />

                <View className="mb-4 mt-4 ml-5">
                    <Text className="text-gray-700 font-semibold">Address Customer</Text>
                    <View className='flex-row'>
                        <Text className="text-black text-xl">{order.receiverName} -</Text><Text className='mt-1 text-gray-500 ml-2'>{order.contactPhoneNumber}</Text>
                    </View>
                    <Text className="text-gray-700">Address: {order.shippingAddress}</Text>
                </View>
            </View>

            {order.orderDetails.map((item: any, index: any) => (
                <View key={index} className="bg-white p-4 rounded-lg m-3">
                    <View className="flex-row mt-2">
                        <Image
                            source={{ uri: item.productImageUrl }}
                            className="w-20 h-20 rounded-md"
                        />
                        <View className="ml-4 flex-1">
                            <Text className="text-gray-800 text-xl font-semibold">{item.productName}</Text>
                            <Text className="text-gray-600 self-end">x{item.quantity}</Text>
                            <Text className="text-black font-bold mt-4 self-end">{item.unitPrice.toLocaleString()} VNĐ</Text>
                        </View>
                    </View>
                    <View className="border-b border-gray-300 my-4" />
                    <View className="self-end mt-2">
                        <Text className="text-red-500 font-bold">Total Amount: {item.unitPrice.toLocaleString()} VNĐ</Text>
                    </View>
                </View>
            ))}
            <View className="bg-white p-4 rounded-lg mb-3 ml-3 mr-3 mt-1 justify-between">
                <Text className='font-semibold text-orange-500 text-xl mb-2'>Order Information</Text>
                <View className='mt-2 flex-row'>
                    <Text className="text-gray-700 font-semibold flex-1">Payment Method</Text>
                    <Text className="text-gray-600 text-right">{order.paymentMethodName}</Text>
                </View>
                <View className='mt-2 flex-row'>
                    <Text className="text-gray-700 font-semibold flex-1">Status Order</Text>
                    <Text className="text-gray-600 text-right">{order.status}</Text>
                </View>
            </View>
        </ScrollView>
    )
}