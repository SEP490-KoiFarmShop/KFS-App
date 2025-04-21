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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuctionInvoiceItem({ item }: any) {
  if (!item) return null;

  const [loading, setLoading] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const router = useRouter();

  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDetail = async () => {
    router.push(
      `/(components)/invoice/InvoiceDetail?invoiceId=${item.invoiceId}`
    );
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.get(
        `https://kfsapis.azurewebsites.net/api/v1/auction-invoices/${item.invoiceId}/payment`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Payment", "Processing payment...", [
          {
            text: "OK",
            onPress: () =>
              Linking.openURL(response.data.paymentUrl)
                .then(() => {
                  router.push("/(components)/PaymentSuccess");
                })
                .catch(() => {
                  Alert.alert("Error", "Could not open payment link.");
                }),
          },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Could not process payment.");
    } finally {
      setLoading(false);
    }
  };

  const confirmReceived = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to mark this item as received?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: handleMarkReceived,
        },
      ],
      { cancelable: true }
    );
  };

  const handleMarkReceived = async () => {
    try {
      setFinishLoading(true);
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.put(
        `https://kfsapis.azurewebsites.net/api/v1/auction-invoices/finished/${item.invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Item marked as received.");
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to update status"
        );
      }
    } catch (error) {
      console.error("Error marking as received:", error);
      Alert.alert("Error", "An error occurred while updating status.");
    } finally {
      setFinishLoading(false);
    }
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-md mb-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-700 font-bold">#{item.invoiceId}</Text>
        <Text
          className={`font-semibold ${
            item.status === "Delivered"
              ? "text-green-500"
              : item.status === "InvoiceCreated"
              ? "text-yellow-500"
              : item.status === "Paid"
              ? "text-blue-500"
              : "text-red-500"
          }`}
        >
          {item.status}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-20 h-20 rounded-lg"
          resizeMode="cover"
        />
        <View className="ml-3 flex-1">
          <Text className="text-gray-700 font-semibold">{item.name}</Text>
          <Text className="text-gray-500">
            Auction ended: {formatDate(item.endTime)}
          </Text>
          <Text className="text-gray-500">
            Your bid: {new Intl.NumberFormat("vi-VN").format(item.yourMaxBid)}{" "}
            VND
          </Text>
        </View>
      </View>

      <View className="mt-3 items-end">
        <Text className="text-gray-700 font-semibold text-right">
          Final Price: {new Intl.NumberFormat("vi-VN").format(item.soldAtPrice)}{" "}
          VND
        </Text>
      </View>

      <View className="flex-row justify-end mt-3 gap-2">
        <TouchableOpacity
          className="bg-blue-500 px-3 py-1 rounded-md"
          onPress={handleDetail}
        >
          <Text className="text-white font-semibold">Details</Text>
        </TouchableOpacity>

        {item.status === "InvoiceCreated" && (
          <TouchableOpacity
            className="bg-orange-500 px-3 py-1 rounded-md"
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text className="text-white font-semibold">Pay Now</Text>
            )}
          </TouchableOpacity>
        )}

        {/* {item.status === "Delivered" && (
          <TouchableOpacity
            className="bg-green-500 px-3 py-1 rounded-md"
            onPress={confirmReceived}
            disabled={finishLoading}
          >
            {finishLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text className="text-white font-semibold">Received</Text>
            )}
          </TouchableOpacity>
        )} */}
      </View>
    </View>
  );
}
