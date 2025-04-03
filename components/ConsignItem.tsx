import { View, Text, Image, TouchableOpacity, Linking, Alert } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import axios from "axios";

export default function ConsignItem({ item }: any) {
    const router = useRouter();

    const submit = async () => {
        try {
            const response = await axios.post(
                `https://kfsapis.azurewebsites.net/api/Consignment/DepositPaymentForConsignment/Re-payment?consignmentId=${item.id}`
            );

            if (response.data.return_code === 1) {
                const orderUrl = response.data.order_url;
                if (orderUrl) {
                    Linking.openURL(orderUrl)
                        .then(() => {
                            router.push("/(components)/consignment/ConsignmentList");
                        })
                        .catch(err => {
                            console.error("Linking error:", err);
                            Alert.alert("Error", "Cannot open ZaloPay. Please make sure the app is installed.");
                        });
                    ;
                } else {
                    alert("Không tìm thấy đường dẫn thanh toán!");
                }
            } else {
                alert("Giao dịch không thành công!");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    };

    return (
        <View className="bg-white p-4 rounded-lg shadow-md mb-5 ml-5 mr-5">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
                <Text className="font-bold text-gray-700">Sources: {item.source}</Text>
                <Text className="text-red-500 font-semibold">{item.status}</Text>
            </View>

            {/* Product Info */}
            <View className="flex-row flex-wrap ml-3">
                <Text className="text-gray-500 text-sm mr-3">
                    <Text className="font-semibold text-gray-700">Variety:</Text> {item.varieties}
                </Text>
                <Text className="text-gray-500 text-sm mr-3">
                    <Text className="font-semibold text-gray-700">Sex:</Text> {item.gender}
                </Text>
                <Text className="text-gray-500 text-sm mr-3">
                    <Text className="font-semibold text-gray-700">Method of selling:</Text> {item.methodOFSelling}
                </Text>
                <Text className="text-gray-500 text-sm mr-3">
                    <Text className="font-semibold text-gray-700">Method of consignment:</Text> {item.methodOfConsignment}
                </Text>
                <Text className="text-gray-500 text-sm mr-3">
                    <Text className="font-semibold text-gray-700">Desired price:</Text> {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.desiredPrice)}
                </Text>
                <Text className="text-gray-500 text-sm">
                    <Text className="font-semibold text-gray-700">Notes:</Text> {item.notes}
                </Text>
                <Text className="text-sm">
                    <Text className="font-semibold text-gray-700">Final Amount: </Text>
                    <Text className="text-green-600 font-semibold">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.finalPayoutAmount)}
                    </Text>
                </Text>
            </View>

            {item.status === "Approved" && (
                <View className="flex-row justify-end mt-3">

                    <TouchableOpacity className="bg-red-500 px-3 py-1 rounded-md ml-2" onPress={() => router.push(`/(components)/consignment/ConsignmentDetail?id=${item.id}`)}>
                        <Text className="text-white font-semibold">View detail</Text>
                    </TouchableOpacity>
                </View>
            )}

            {item.status === "PendingPayout" && (
                <View className="flex-row justify-end mt-3">
                    <TouchableOpacity className="bg-red-500 px-3 py-1 rounded-md ml-2" onPress={submit}>
                        <Text className="text-white font-semibold">Re Payment</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
}
