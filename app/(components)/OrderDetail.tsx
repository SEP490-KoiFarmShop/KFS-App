import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { RadioButton } from 'react-native-paper';

const paymentMethods = [
    { id: 1, name: "Banking" },
    { id: 2, name: "COD" },
    { id: 3, name: "Wallet" },
];

export default function OrderDetail() {
    const { orderId, fullName, contactPhoneNumber, address } = useLocalSearchParams();
    const router = useRouter();
    const [orderData, setOrderData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = await AsyncStorage.getItem("userData");

                if (!token) {
                    Alert.alert("Error", "You need to login first!");
                    router.push("/(auth)/LoginScreen");
                    return;
                }

                const parsedToken = JSON.parse(token);
                const jwtToken = parsedToken?.accessToken;

                setIsLoading(true);

                const formattedOrderId = Array.isArray(orderId)
                    ? orderId.join("").replace(/x/g, "&koi-fish-ids=")
                    : orderId.replace(/x/g, "&koi-fish-ids=");

                const response = await axios.get(
                    `https://kfsapis.azurewebsites.net/api/v1/orders/check-out?koi-fish-ids=${formattedOrderId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                setOrderData(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const handleConfirmOrder = async () => {
        if (selectedPaymentMethod === null) {
            Alert.alert("Error", "Please select a payment method!");
            return;
        }

        const token = await AsyncStorage.getItem("userData");
        if (!token) {
            Alert.alert("Error", "You need to login first!");
            router.push('/(auth)/LoginScreen');
            return;
        }

        const parsedToken = JSON.parse(token);
        const jwtToken = parsedToken?.accessToken;

        const orderPayload = {
            fullName: fullName || "N/A",
            contactPhoneNumber: contactPhoneNumber || "N/A",
            address: address || "N/A",
            koiFishIds: orderData.items.map((item: any) => item.id),
            paymentMethodId: selectedPaymentMethod,
            totalAmount: orderData.paymentDetails["Total Amount"],
            shippingCost: orderData.paymentDetails["Shipping Cost"],
            membershipDiscount: orderData.paymentDetails["Membership Discount"],
            finalAmount: orderData.paymentDetails["Final Amount"],
        };

        try {
            const response = await axios.post(
                "https://kfsapis.azurewebsites.net/api/v1/orders/",
                orderPayload,
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                // console.log("Order response:", response.data);

                if (response.data?.order_url) {
                    Linking.openURL(response.data.order_url)
                        .then(() => {
                            router.push("OrderSuccess");
                        })
                        .catch(() => {
                            Alert.alert("Lỗi", "Không thể mở liên kết thanh toán.");
                        });
                } else {
                    Alert.alert("Success", "Your order has been placed successfully!", [
                        { text: "OK", onPress: () => router.push("OrderSuccess") }
                    ]);
                }
            } else if (response.status === 201) {
                router.push("OrderSuccess");
            }
            else {
                Alert.alert("Error", "Failed to place the order. Please try again.");
            }
        } catch (error) {
            console.error("Order error:", error);
            Alert.alert("Error", "Failed to place the order. Please try again.");
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color="#FF6B00" />;
    }

    if (!orderData) {
        return <Text className="text-center text-gray-500 mt-10">Không tìm thấy đơn hàng</Text>;
    }

    return (
        <View className="flex-1 bg-gray-100">
            <SafeAreaView className="flex-1">
                {/* Go Back */}
                <View className="flex-row items-center p-5 bg-white shadow-md">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-gray-100">
                        <Entypo name="chevron-thin-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="ml-4 text-2xl font-bold">Order Details</Text>
                </View>

                {/* Cart Items */}
                <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                    <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-3">
                        {fullName && contactPhoneNumber && address ? (
                            <View>
                                <Text className="text-lg font-semibold text-gray-800">Recipient Information</Text>
                                <Text className="text-gray-600 mt-1">
                                    <Text className="font-bold">Name:</Text> {fullName}
                                </Text>
                                <Text className="text-gray-600 mt-1">
                                    <Text className="font-bold">Phone:</Text> {contactPhoneNumber}
                                </Text>
                                <Text className="text-gray-600 mt-1">
                                    <Text className="font-bold">Address:</Text> {address}
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-white shadow-md rounded-lg"
                                onPress={() => router.push(`/AddOrderInfor?orderId=${orderId}`)}
                            >
                                <AntDesign name="pluscircleo" size={24} color="black" />
                                <Text className="ml-3">Add Order Information</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {orderData.items.length > 0 ? (
                        orderData.items.map((item: any, index: any) => (
                            <View key={index} className="flex-row items-center p-4 bg-white shadow-md rounded-lg my-2 mx-3">
                                <Image
                                    source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/icon/defaultimage.jpg")}
                                    className="w-[70px] h-[70px] rounded-lg shadow-md"
                                    resizeMode="contain"
                                />
                                <View className="ml-3 flex-1">
                                    <Text className="font-bold text-lg text-gray-800">{item.name}</Text>
                                    <Text className="text-gray-600 text-sm">Số lượng: {item.quantity}</Text>
                                </View>
                                <Text className="font-semibold text-lg text-orange-500">
                                    {item.price.toLocaleString()} VND
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text className="text-center text-gray-500 mt-10">Cart empty</Text>
                    )}

                    {/* Payment Method Selection */}
                    <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-3 mt-32">
                        <Text className="text-lg font-semibold text-gray-800">Select Payment Method</Text>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="mt-2">
                            <View className="flex-row gap-4">
                                {paymentMethods.map((method) => (
                                    <TouchableOpacity
                                        key={method.id}
                                        className={`flex-row items-center px-4 py-2 rounded-lg border ${selectedPaymentMethod === method.id ? "border-orange-500 bg-orange-100" : "border-gray-300"
                                            }`}
                                        onPress={() => setSelectedPaymentMethod(method.id)}
                                    >
                                        <RadioButton
                                            value={method.id.toString()}
                                            status={selectedPaymentMethod === method.id ? "checked" : "unchecked"}
                                            onPress={() => setSelectedPaymentMethod(method.id)}
                                            color="#FF6B00"
                                        />
                                        <Text className="ml-2 text-gray-700 text-lg">{method.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Summary */}
                    <View className="mt-3 p-3 bg-gray-50 rounded-lg shadow-md mx-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700 text-lg">Subtotal</Text>
                            <Text className="text-gray-700 text-lg">
                                {orderData.paymentDetails["Total Amount"].toLocaleString()} VND
                            </Text>
                        </View>
                        <View className="flex-row justify-between mt-2">
                            <Text className="text-gray-700 text-lg">Shipping Cost</Text>
                            <Text className="text-gray-700 text-lg">
                                {orderData.paymentDetails["Shipping Cost"].toLocaleString()} VND
                            </Text>
                        </View>
                        {/* <View className="flex-row justify-between mt-2">
                            <Text className="text-orange-500 font-semibold text-lg">Membership Discount</Text>
                            <Text className="text-orange-500 font-semibold text-lg">
                                - {orderData.paymentDetails["Membership Discount"].toLocaleString()} VND
                            </Text>
                        </View> */}
                        <View className="flex-row justify-between mt-3 border-t border-gray-300 pt-2">
                            <Text className="font-bold text-xl">Total</Text>
                            <Text className="font-bold text-xl text-orange-500">
                                {orderData.paymentDetails["Final Amount"].toLocaleString()} VND
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Checkout Section */}
                <View className="absolute bottom-0 left-0 right-0 bg-white p-5 shadow-lg">
                    <CustomButton
                        title="Confirm"
                        handlePress={handleConfirmOrder}
                        containerStyles="bg-orange-500 h-14 rounded-lg shadow-md mt-5"
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}