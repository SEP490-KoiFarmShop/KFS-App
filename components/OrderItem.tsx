import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderItem({ item }: any) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // console.log(item);

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

  const handleCancel = async () => {
    try {
      const tokenData = await AsyncStorage.getItem("userData");
      if (!tokenData) {
        Alert.alert("Error", "You need to login first!");
        return;
      }

      const parsedToken = JSON.parse(tokenData);
      const jwtToken = parsedToken?.accessToken;

      Alert.alert("Cancel", "Do you want cancel this order ?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await axios.put(
                `https://kfsapis.azurewebsites.net/api/v1/orders/cancelled/${item.id}`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              Alert.alert("Success", "Order has been cancelled successfully");
            } catch (error: any) {
              console.error(
                "Error:",
                error.response.data.Message || error.message
              );
              Alert.alert(
                "Error",
                error.response.data.Message || "Failed to cancel order"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error", error.response.data.Message);
      Alert.alert("Error", "Unable to access user data");
    }
  };

  const handleDetail = async () => {
    router.push(`/(components)/order/OrderDetail?orderId=${item.id}`);
  };

  const renderOrderItem = ({ item: orderDetail }: any) => (
    <View className="flex-row items-center mb-3 border-b border-gray-100 pb-3">
      <Image
        source={{ uri: orderDetail.imageUrl }}
        className="w-16 h-16 rounded-lg"
        resizeMode="contain"
      />
      <View className="ml-3 flex-1">
        <Text
          className="text-gray-700 font-semibold"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {orderDetail.name}
        </Text>
        <Text className="text-gray-500">Quantity: {orderDetail.quantity}</Text>
        <Text className="text-gray-500">
          Price: {new Intl.NumberFormat("vi-VN").format(orderDetail.unitPrice)}{" "}
          VND
        </Text>
      </View>
    </View>
  );

  return (
    <View className="bg-white p-4 rounded-lg shadow-md mb-5 mx-5">
      <View className="flex-row justify-between mb-4">
        <Text className="text-gray-600 font-medium">
          Order #{item.id.substring(0, 8)}...
        </Text>
        <Text
          className={`font-semibold ${
            item.status === "Finished"
              ? "text-green-500"
              : item.status === "Confirmed"
              ? "text-blue-500"
              : "text-red-500"
          }`}
        >
          {item.status}
        </Text>
      </View>

      <FlatList
        data={item.orderDetails}
        renderItem={renderOrderItem}
        keyExtractor={(orderDetail, index) => `${item.id}-${index}`}
        scrollEnabled={false}
      />

      <View className="mt-3 items-end">
        <Text className="text-gray-700 font-semibold text-right">
          Final Amount:{" "}
          {new Intl.NumberFormat("vi-VN").format(item.finalAmount)} VND
        </Text>
      </View>

      <View className="flex-row justify-end mt-3">
        {item.status === "PendingPayment" && (
          <View className="flex-row justify-end mt-3">
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-md ml-2"
              onPress={handleRePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text className="text-white font-semibold">Re-payment</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* {item.status === "PendingPayment" && (
          
        )} */}
        <View className="flex-row justify-end mt-3">
          <TouchableOpacity
            className="bg-orange-500 px-4 py-2 rounded-md ml-2"
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
      </View>
    </View>
  );
}
