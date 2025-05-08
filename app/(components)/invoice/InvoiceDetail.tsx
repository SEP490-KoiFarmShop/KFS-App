import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ActivityIndicator } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuctionInvoiceDetail() {
  const router = useRouter();
  const { invoiceId } = useLocalSearchParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        // Fetch auction invoice details
        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/auction-invoices/${invoiceId}/confirm`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Invoice data:", response.data.data);
        setInvoice(response.data.data);
      } catch (error: any) {
        console.error("Error fetching invoice details:", error);
        console.error("Error details:", error.response.data.Message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data) {
          setUserData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch user information:", err);
      }
    };

    fetchUserDetail();
  }, []);

  // Format date to display in a more readable format
  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
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
      case "Delivered":
        return "bg-green-100 text-green-600";
      case "Delivering":
        return "bg-blue-100 text-blue-600";
      case "InvoiceCreated":
        return "bg-yellow-100 text-yellow-600";
      case "Paid":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff0000" />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-700">No invoice data available</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="w-full mb-2 flex-row items-center space-x-4 bg-white pb-3 pt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-200 ml-2"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="font-bold text-3xl text-gray-900">
            Invoice Detail
          </Text>
          <Text className="font-light text-gray-500">
            Auction invoice information
          </Text>
        </View>
      </View>

      {/* Status Header */}
      <View className="bg-white m-3 rounded-lg shadow-sm">
        <View
          className={`p-4 rounded-t-lg ${
            getStatusColor(invoice.status).split(" ")[0]
          }`}
        >
          <Text
            className={`font-bold ${
              getStatusColor(invoice.status).split(" ")[1]
            }`}
          >
            Status: {invoice.status}
          </Text>
        </View>

        {/* Status Timeline */}
        <View className="bg-white m-3 p-4 rounded-lg shadow-sm mb-6">
          <Text className="font-semibold text-gray-800 text-lg mb-3">
            Status Timeline
          </Text>

          {invoice.invoiceStatusTrackings &&
            invoice.invoiceStatusTrackings.map((tracking: any, index: any) => (
              <View key={index} className="flex-row mb-4">
                {/* Timeline line */}
                <View className="items-center mr-4">
                  <View
                    className={`w-4 h-4 rounded-full ${
                      index === 0 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  {index !== invoice.invoiceStatusTrackings.length - 1 && (
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

        {/* Invoice information */}
        <View className="p-4">
          <Text className="text-gray-700 font-semibold text-lg mb-2">
            Invoice #{invoice.invoiceId}
          </Text>
          <Text className="text-gray-700">
            Lot: #{invoice.lotId} - {invoice.lotName}
          </Text>

          {/* Latest status */}
          {invoice.invoiceStatusTrackings &&
            invoice.invoiceStatusTrackings.length > 0 && (
              <View className="flex-row mt-3 items-center">
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={24}
                  color="#4B5563"
                />
                <View className="ml-3">
                  <Text
                    className={
                      getStatusColor(
                        invoice.invoiceStatusTrackings[0].currentStatus
                      ).split(" ")[1]
                    }
                  >
                    {invoice.invoiceStatusTrackings[0].description}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {formatDate(invoice.invoiceStatusTrackings[0].createdAt)}
                  </Text>
                </View>
              </View>
            )}
        </View>
      </View>

      {/* Customer Information */}
      <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
        <Text className="font-semibold text-gray-800 text-lg mb-3">
          Customer Information
        </Text>
        <View className="mb-2">
          <Text className="text-gray-600">Name</Text>
          <Text className="text-gray-900 font-medium">
            {invoice.customerName}
          </Text>
        </View>
        <View className="mb-2">
          <Text className="text-gray-600">Email</Text>
          <Text className="text-gray-900 font-medium">{invoice.email}</Text>
        </View>
        {invoice.phone && (
          <View className="mb-2">
            <Text className="text-gray-600">Phone</Text>
            <Text className="text-gray-900 font-medium">{invoice.phone}</Text>
          </View>
        )}
        {invoice.address && (
          <View>
            <Text className="text-gray-600">Address</Text>
            <Text className="text-gray-900 font-medium">{invoice.address}</Text>
          </View>
        )}
      </View>

      {/* Auction Information */}
      <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
        <Text className="font-semibold text-gray-800 text-lg mb-3">
          Auction Information
        </Text>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-600">Lot ID</Text>
          <Text className="text-gray-900 font-medium">#{invoice.lotId}</Text>
        </View>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-600">Lot Name</Text>
          <Text className="text-gray-900 font-medium">{invoice.lotName}</Text>
        </View>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-600">Your Bid</Text>
          <Text className="text-gray-900 font-medium">
            {formatCurrency(invoice.bidPrice)}
          </Text>
        </View>
      </View>

      {/* Payment Details */}
      <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
        <Text className="font-semibold text-gray-800 text-lg mb-3">
          Payment Details
        </Text>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-600">Bid Price</Text>
          <Text className="text-gray-900 font-medium">
            {formatCurrency(invoice.bidPrice)}
          </Text>
        </View>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-600">Platform Fee</Text>
          <Text className="text-gray-900 font-medium">
            {formatCurrency(invoice.platformFee)}
          </Text>
        </View>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-600">Shipping Fee</Text>
          <Text className="text-gray-900 font-medium">
            {formatCurrency(invoice.shippingFee)}
          </Text>
        </View>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-600">Deposit Amount</Text>
          <Text className="text-gray-900 font-medium">
            - {formatCurrency(invoice.depositAmount)}
          </Text>
        </View>
        <View className="pt-3 border-t border-gray-200 flex-row justify-between">
          <Text className="text-gray-800 font-bold">Total Amount</Text>
          <Text className="text-red-600 font-bold text-lg">
            {formatCurrency(invoice.totalAmount)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
