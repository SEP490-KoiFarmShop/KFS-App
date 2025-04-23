import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import Entypo from "@expo/vector-icons/Entypo";
import { useFocusEffect } from "@react-navigation/native";

export default function DeliveryDetail() {
  const { deliveryId } = useLocalSearchParams();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useEffect(() => {
  //   const fetchDeliveryDetail = async () => {
  //     try {
  //       const userData = await AsyncStorage.getItem("userData");
  //       const parsedToken = JSON.parse(userData || "{}");
  //       const jwtToken = parsedToken?.accessToken;

  //       const response = await axios.get(
  //         `https://kfsapis.azurewebsites.net/api/v1/deliveries/${deliveryId}/shipper`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${jwtToken}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       if (response.data.success) {
  //         setDelivery(response.data.data);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch delivery detail:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (deliveryId) {
  //     fetchDeliveryDetail();
  //   }
  // }, [deliveryId]);

  useFocusEffect(
    useCallback(() => {
      const fetchDeliveryDetail = async () => {
        try {
          const userData = await AsyncStorage.getItem("userData");
          const parsedToken = JSON.parse(userData || "{}");
          const jwtToken = parsedToken?.accessToken;

          const response = await axios.get(
            `https://kfsapis.azurewebsites.net/api/v1/deliveries/${deliveryId}/shipper`,
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success) {
            setDelivery(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch delivery detail:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchDeliveryDetail();
    }, [deliveryId])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-500 mt-2">Loading data...</Text>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500">Delivery not found.</Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpdate = () => {
    router.push(`/DeliveryUpdate?deliveryId=${deliveryId}`);
  };

  const canUpdate = !["Delivered", "Rejected"].includes(delivery.status);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-5 bg-white shadow-md">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-100"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-bold">#{delivery.deliveryId}</Text>
      </View>
      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Text className="text-2xl font-bold text-orange-600">
            🚚 Delivery #{delivery.deliveryId}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Order ID: {delivery.orderId}
          </Text>
        </View>

        <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold mb-2">👤 Customer</Text>
          <View className="flex-row items-center mb-1">
            <FontAwesome name="user" size={18} color="#444" />
            <Text className="ml-2 text-base">Full Name: {delivery.name}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <FontAwesome name="phone" size={18} color="#444" />
            <Text className="ml-2 text-base">
              Phone Number: {delivery.phoneNumber}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold mb-2">
            📍 Delivery Information
          </Text>
          <View className="flex-row items-start mb-2">
            <Ionicons name="storefront" size={20} color="#444" />
            <Text className="ml-2 text-base">
              Pickup Point: {delivery.pickupPoint}
            </Text>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="location" size={20} color="#444" />
            <Text className="ml-2 text-base">
              Delivery Point: {delivery.deliveryPoint}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold mb-2">📦 Order Details</Text>
          <Text className="text-base mb-1">
            💰 Total Amount:{" "}
            <Text className="font-semibold text-green-700">
              {formatCurrency(delivery.totalAmount)}
            </Text>
          </Text>
          <Text className="text-base mb-1">
            🧾 Order Type:{" "}
            <Text className="font-medium">{delivery.orderType}</Text>
          </Text>
          <Text className="text-base">
            🚨 Status:{" "}
            <Text
              className={`font-bold ${
                delivery.status === "Assigned"
                  ? "text-blue-600"
                  : delivery.status === "Delivered"
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {delivery.status}
            </Text>
          </Text>
        </View>

        <View className="bg-white rounded-xl shadow p-4 border border-gray-200">
          <Text className="text-lg font-semibold mb-2">📋 Items</Text>
          {delivery.items.map((item: any, index: number) => (
            <View key={index} className="mb-1">
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="arrow-right" size={18} color="#666" />
                <Text className="ml-2 text-base">
                  Product: <Text className="font-semibold">{item.name}</Text>
                </Text>
              </View>

              <View className="flex-row items-center mb-1">
                <MaterialIcons name="arrow-right" size={18} color="#666" />
                <Text className="ml-2 text-base">
                  Quantity: {item.quantity}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold mb-2">
            📸 Picked Up Images
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {delivery.pickedUpImageUrls.map((uri: string, index: number) => (
              <Image
                key={index}
                source={{ uri }}
                style={{
                  width: 200,
                  height: 160,
                  marginRight: 10,
                  borderRadius: 10,
                }}
                resizeMode="cover"
                // onError={(e) => console.log("Image load error:", e.nativeEvent)}
              />
            ))}
          </ScrollView>
        </View>

        <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold mb-2">
            📸 Delivered Images
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {delivery.deliveredImageUrls.map((uri: string, index: number) => (
              <Image
                key={index}
                source={{ uri }}
                style={{
                  width: Dimensions.get("window").width * 0.6,
                  height: 160,
                  borderRadius: 10,
                  marginRight: 10,
                }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {canUpdate && (
        <View className="absolute bottom-4 left-4 right-4">
          <CustomButton
            title="Update Delivery"
            handlePress={handleUpdate}
            containerStyles="bg-orange-500 h-12 px-6 rounded-full shadow-md"
          />
        </View>
      )}
    </SafeAreaView>
  );
}
