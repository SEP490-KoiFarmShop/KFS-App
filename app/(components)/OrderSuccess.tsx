import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  console.log(orderId);

  const viewDetail = () => {
    router.push(`/(components)/order/OrderHome?orderStatus=Pending`);
  };

  const goHome = () => {
    router.push("/(tabs)/home");
  };

  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-full h-[55%] bg-orange-500 items-center justify-center rounded-b-3xl">
        <Image
          source={require("../../assets/icon/ordersuccess.jpg")}
          className="w-56 h-56"
          resizeMode="contain"
        />
      </View>

      <View className="w-full h-[45%] bg-gray-100 p-6rounded-3xl shadow-lg items-center mt-10">
        <Text className="text-2xl font-bold text-gray-800">
          Order Placed Successfully
        </Text>
        <Text className="text-gray-500 mt-2">
          You will receive an email confirmation
        </Text>

        <View className="flex-row mt-6 space-x-4">
          <TouchableOpacity
            className="bg-orange-500 px-6 py-3 rounded-full flex-1 items-center ml-2"
            onPress={viewDetail}
          >
            <Text className="text-white text-lg font-semibold">Order List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-500 px-6 py-3 rounded-full flex-1 items-center ml-5 mr-2"
            onPress={goHome}
          >
            <Text className="text-gray-800 text-lg font-semibold">Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
