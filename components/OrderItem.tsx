import { View, Text, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function OrderItem({ item }: any) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRePayment = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `https://kfsapis.azurewebsites.net/${item.id}/re-payment`,
            );

            if (response.data.return_code === 1) {
                Alert.alert("Payment", "Transactioning ...", [
                    {
                        text: "OK", onPress: () => Linking.openURL(response.data.order_url)
                            .then(() => {
                                router.push("OrderSuccess");
                            })
                            .catch(() => {
                                Alert.alert("Lỗi", "Không thể mở liên kết thanh toán.");
                            })
                    }
                ]);
            } else {
                Alert.alert("Lỗi", response.data.return_message);
            }
        } catch (error) {
            console.error("Lỗi thanh toán lại:", error);
            Alert.alert("Lỗi", "Không thể thực hiện thanh toán lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="bg-white p-4 rounded-lg shadow-md mb-5 ml-5 mr-5">
            {/* Header */}
            <View className="flex-row justify-end mb-2">
                <Text className="text-red-500 font-semibold">Status: {item.status}</Text>
            </View>

            {/* Product Info */}
            {item.orderDetails.length > 0 && (
                <View className="flex-row items-center">
                    <Image
                        source={{ uri: item.orderDetails[0].imageUrl }}
                        className="w-20 h-20 rounded-lg"
                        resizeMode="contain"
                    />
                    <View className="ml-3">
                        <Text className="text-gray-700 font-semibold">
                            {item.orderDetails[0].name}
                        </Text>
                        <Text className="text-gray-500">Quantity: {item.orderDetails[0].quantity}</Text>
                        <Text className="text-gray-500">
                            Price: {new Intl.NumberFormat("vi-VN").format(item.orderDetails[0].unitPrice)} VND
                        </Text>
                    </View>
                </View>
            )}

            {/* Total Amount */}
            <View className="mt-3 items-end">
                <Text className="text-gray-700 font-semibold text-right">
                    Final Amount: {new Intl.NumberFormat("vi-VN").format(item.finalAmount)} VND
                </Text>
            </View>

            {/* Buttons */}
            {item.status === "PendingPayment" && (
                <View className="flex-row justify-end mt-3">
                    <TouchableOpacity
                        className="bg-orange-500 px-3 py-1 rounded-md"
                        onPress={handleRePayment}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text className="text-white font-semibold">Re payment</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
