import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ActivityIndicator } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderDetail() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [orderTrackings, setOrderTrackings] = useState<any[]>([]);
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

        // Fetch order details
        const orderResponse = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        // console.log(orderResponse.data.data);
        setOrder(orderResponse.data.data);

        // Fetch order tracking data
        const trackingResponse = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/orders/${orderId}/order-trackings`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Sort trackings by creation date (newest first)
        const sortedTrackings = trackingResponse.data.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrderTrackings(sortedTrackings);
      } catch (error: any) {
        console.error("Error fetching order details:", error);
        console.error("Error status:", error.response?.status);
        console.error("Error details:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  // Format date to display in a more readable format
  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // Get status color based on current status
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Finished":
        return "bg-green-100 text-green-600";
      case "PendingPayment":
        return "bg-yellow-100 text-yellow-600";
      case "Pending":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

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
          <Text className="font-light text-gray-500">
            Used for shipping orders
          </Text>
        </View>
      </View>

      <View className="bg-white m-3">
        <View className="bg-green-100 p-4 rounded-lg mb-4">
          <Text className="text-green-600 font-bold">{order.status}</Text>
        </View>

        <View className="mt-3 ml-5 mb-3">
          <Text className="text-gray-700 font-semibold">
            Delivery Information
          </Text>
          <Text className="text-gray-600">{order.shippingAddress}</Text>
          <View className="flex-row mt-2">
            <MaterialCommunityIcons
              className="mt-3"
              name="truck-fast-outline"
              size={24}
              color="black"
            />
            <View>
              <Text className="mt-2 ml-3 text-green-600">
                {order.latestOrderTracking?.description || "Đang xử lý"}
              </Text>
              <Text className="text-gray-600 ml-3">
                {new Date(order.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Tracking Timeline */}
        <View className="mx-5 my-3">
          <Text className="text-gray-700 font-semibold text-lg mb-3">
            Order Tracking
          </Text>
          {orderTrackings.map((tracking, index) => (
            <View key={index} className="flex-row mb-4">
              {/* Timeline line */}
              <View className="items-center mr-4">
                <View
                  className={`w-4 h-4 rounded-full ${
                    index === 0 ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                {index !== orderTrackings.length - 1 && (
                  <View className="w-0.5 h-16 bg-gray-300" />
                )}
              </View>

              {/* Tracking details */}
              <View className="flex-1">
                <View
                  className={`px-3 py-1 rounded-full self-start ${
                    getStatusColor(tracking.currentStatus).split(" ")[0]
                  }`}
                >
                  <Text
                    className={
                      getStatusColor(tracking.currentStatus).split(" ")[1]
                    }
                  >
                    {tracking.currentStatus}
                  </Text>
                </View>
                <Text className="text-gray-800 font-medium mt-1">
                  {tracking.description}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {formatDate(tracking.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="border-b border-gray-300 my-4" />

        <View className="mb-4 mt-4 ml-5">
          <Text className="text-gray-700 font-semibold">Address Customer</Text>
          <View className="flex-row">
            <Text className="text-black text-xl">{order.receiverName} -</Text>
            <Text className="mt-1 text-gray-500 ml-2">
              {order.contactPhoneNumber}
            </Text>
          </View>
          <Text className="text-gray-700">
            Address: {order.shippingAddress}
          </Text>
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
              <Text className="text-gray-800 text-xl font-semibold">
                {item.productName}
              </Text>
              <Text className="text-gray-600 self-end">x{item.quantity}</Text>
              <Text className="text-black font-bold mt-4 self-end">
                {item.unitPrice.toLocaleString()} VNĐ
              </Text>
            </View>
          </View>
          <View className="border-b border-gray-300 my-4" />
          <View className="self-end mt-2">
            <Text className="text-red-500 font-bold">
              Total Amount:{" "}
              {(
                item.unitPrice * item.quantity.toLocaleString()
              ).toLocaleString()}{" "}
              VNĐ
            </Text>
          </View>
        </View>
      ))}
      <View className="bg-white p-4 rounded-lg mb-3 ml-3 mr-3 mt-1 justify-between">
        <Text className="font-semibold text-orange-500 text-xl mb-2">
          Order Information
        </Text>
        <View className="mt-2 flex-row">
          <Text className="text-gray-700 font-semibold flex-1">
            Payment Method
          </Text>
          <Text className="text-orange-600 text-right">
            {order.paymentMethodName}
          </Text>
        </View>
        <View className="mt-2 flex-row">
          <Text className="text-gray-700 font-semibold flex-1">
            Status Order
          </Text>
          <Text className="text-gray-600 text-right">{order.status}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
