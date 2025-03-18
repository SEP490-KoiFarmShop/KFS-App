import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

export default function ConsignItem({ item }: any) {
    const router = useRouter();
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
            </View>

            {/* Buttons */}
            {item.status === "Approved" && (
                <View className="flex-row justify-end mt-3">
                    {/* <TouchableOpacity className="border border-red-500 px-3 py-1 rounded-md mr-2">
                            <Text className="text-red-500 font-semibold"></Text>
                        </TouchableOpacity> */}
                    <TouchableOpacity className="bg-red-500 px-3 py-1 rounded-md" onPress={() => router.push(`/(components)/consignment/ConsignmentDetail?id=${item.id}`)}>
                        <Text className="text-white font-semibold">View detail</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
