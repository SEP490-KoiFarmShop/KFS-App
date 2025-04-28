import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import React, { useState } from "react";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderItem({ item }: any) {
  const [loading, setLoading] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const router = useRouter();

  const handleRePayment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://kfsapis.azurewebsites.net/api/v1/orders/${item.id}/re-payment`
      );

      if (response.data.return_code === 1) {
        Alert.alert("Payment", "Transactioning ...", [
          {
            text: "OK",
            onPress: () =>
              Linking.openURL(response.data.order_url)
                .then(() => {
                  router.push("OrderSuccess");
                })
                .catch(() => {
                  Alert.alert("Lỗi", "Không thể mở liên kết thanh toán.");
                }),
          },
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

  const handleDetail = async () => {
    router.push(`/(components)/order/OrderDetail?orderId=${item.id}`);
  };

  const confirmFinishOrder = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to mark this order as finished?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: handleFinishOrder,
        },
      ],
      { cancelable: true }
    );
  };

  const handleFinishOrder = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      setFinishLoading(true);

      const response = await axios.put(
        `https://kfsapis.azurewebsites.net/api/v1/orders/finished/${item.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.status === 200) {
        Alert.alert("Success", "Order marked as finished successfully.");
      } else {
        Alert.alert("Error", "Failed to mark order as finished.");
      }
    } catch (error: any) {
      console.error("Error marking order as finished:", error.response?.data);
      Alert.alert(
        "Error",
        "An error occurred while marking the order as finished."
      );
    } finally {
      setFinishLoading(false);
    }
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-md mb-5 ml-5 mr-5">
      <View className="flex-row justify-end mb-2">
        <Text className="text-red-500 font-semibold">
          Status: {item.status}
        </Text>
      </View>

      {item.orderDetails.length > 0 && (
        <View className="flex-row items-center">
          <Image
            source={{ uri: item.orderDetails[0].imageUrl }}
            className="w-20 h-20 rounded-lg"
            resizeMode="contain"
          />
          <View className="ml-3 flex-1">
            <Text
              className="text-gray-700 font-semibold"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.orderDetails[0].name}
            </Text>
            <Text className="text-gray-500">
              Quantity: {item.orderDetails[0].quantity}
            </Text>
            <Text className="text-gray-500">
              Price:{" "}
              {new Intl.NumberFormat("vi-VN").format(
                item.orderDetails[0].unitPrice
              )}{" "}
              VND
            </Text>
          </View>
        </View>
      )}

      <View className="mt-3 items-end">
        <Text className="text-gray-700 font-semibold text-right">
          Final Amount:{" "}
          {new Intl.NumberFormat("vi-VN").format(item.finalAmount)} VND
        </Text>
      </View>

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

      {/* {item.status !== "PendingPayment" && (
        <View className="flex-row justify-end mt-3">
          <TouchableOpacity
            className="bg-orange-500 px-3 py-1 rounded-md"
            onPress={handleDetail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text className="text-white font-semibold">View Detail</Text>
            )}
          </TouchableOpacity>
        </View>
      )} */}

      {item.status !== "PendingPayment" && (
        <View className="flex-row justify-between mt-3 space-x-2">
          <TouchableOpacity
            className="bg-orange-500 px-3 py-1 rounded-md flex-1 items-center"
            onPress={handleDetail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text className="text-white font-semibold">View Detail</Text>
            )}
          </TouchableOpacity>

          {/* {item.status === "Delivered" && (
            <TouchableOpacity
              className="bg-green-500 px-3 py-1 rounded-md flex-1 items-center ml-2"
              onPress={confirmFinishOrder}
              disabled={finishLoading}
            >
              {finishLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text className="text-white font-semibold">
                  Mark as Finished
                </Text>
              )}
            </TouchableOpacity>
          )} */}
        </View>
      )}
    </View>
  );
}
