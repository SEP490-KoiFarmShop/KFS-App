import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ConsignItem({ item, onRefresh }: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Consignment",
      "Are you sure you want to cancel this consignment?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setIsLoading(true);

              // Get JWT token from AsyncStorage
              const userData = await AsyncStorage.getItem("userData");
              if (!userData) {
                router.push("/(auth)/LoginScreen");
                return;
              }

              const parsedToken = JSON.parse(userData);
              const jwtToken = parsedToken?.accessToken;

              const response = await axios.put(
                `https://kfsapis.azurewebsites.net/api/Consignment/ChangeStatus?consignmentId=${item.id}&status=Cancelled`,
                {}, // Empty body for PUT request
                {
                  headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Consignment has been cancelled successfully",
                position: "bottom",
              });

              // Call the refresh function passed from parent component
              if (onRefresh && typeof onRefresh === "function") {
                onRefresh();
              }
            } catch (error) {
              console.error("Error canceling consignment:", error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to cancel consignment. Please try again.",
                position: "bottom",
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-md mb-5 ml-5 mr-5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-gray-700">Breeder: {item.source}</Text>
        <Text className="text-red-500 font-semibold text-xs">
          {item.status}
        </Text>
      </View>

      {/* Product Info */}
      <View className="flex-row flex-wrap ml-3">
        {/* {item?.status !== "Pending" && item?.status !== "Rejected" && ( */}
        {item?.status !== "Pending" && item?.koiFishConsignment?.name && (
          <View>
            <Text className="text-gray-500 text-sm mr-3">
              <Text className="font-semibold text-gray-700">Name:</Text>{" "}
              {item?.koiFishConsignment?.name}
            </Text>
          </View>
        )}
        <Text className="text-gray-500 text-sm mr-3">
          <Text className="font-semibold text-gray-700">Variety:</Text>{" "}
          {item.varieties}
        </Text>
        <Text className="text-gray-500 text-sm mr-3">
          <Text className="font-semibold text-gray-700">Sex:</Text>{" "}
          {item.gender}
        </Text>
        <Text className="text-gray-500 text-sm mr-3">
          <Text className="font-semibold text-gray-700">
            Method of selling:
          </Text>{" "}
          {item.methodOFSelling}
        </Text>
        <Text className="text-gray-500 text-sm mr-3">
          <Text className="font-semibold text-gray-700">
            Method of consignment:
          </Text>{" "}
          {item.methodOfConsignment}
        </Text>
        <Text className="text-gray-500 text-sm mr-3">
          <Text className="font-semibold text-gray-700">Desired price:</Text>{" "}
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(item.desiredPrice)}
        </Text>
        <Text className="text-gray-500 text-sm">
          <Text className="font-semibold text-gray-700">Notes:</Text>{" "}
          {item.notes}
        </Text>
        {item?.status !== "Pending" && (
          <Text className="text-sm">
            <Text className="font-semibold text-gray-700">
              Final Deposit Amount:{" "}
            </Text>
            <Text className="text-green-600 font-semibold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(item?.depositAmount)}
            </Text>
          </Text>
        )}
      </View>

      {(item.status === "Approved" ||
        // item.status === "Rejected" ||
        item.status === "Completed" ||
        item.status === "Accepted") && (
        <View className="flex-row justify-end mt-3">
          <TouchableOpacity
            className="bg-blue-500 px-3 py-1 rounded-md ml-2"
            onPress={() =>
              router.push(
                `/(components)/consignment/ConsignmentDetail?id=${item.id}`
              )
            }
          >
            <Text className="text-white font-semibold">View detail</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === "PendingDepositPayment" && (
        <View className="flex-row justify-end mt-3">
          <TouchableOpacity
            className="bg-orange-500 px-3 py-1 rounded-md ml-2"
            onPress={() =>
              router.push(`/(components)/consignment/OTPSuccess?id=${item.id}`)
            }
          >
            <Text className="text-white font-semibold">Re-Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === "Pending" && (
        <View className="flex-row justify-end mt-3">
          <TouchableOpacity
            className="bg-red-500 px-3 py-1 rounded-md ml-2"
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold">
              {isLoading ? "Cancelling..." : "Cancel Consignment"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
