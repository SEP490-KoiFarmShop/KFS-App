import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from "@expo/vector-icons/Entypo";

export default function Wallet() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [balance, setBalance] = useState<any>("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;

  const transactionTypes = [
    { name: "All", type: "" },
    { name: "Payment", type: "Payment" },
    { name: "Refund", type: "Refund" },
    { name: "Withdraw", type: "Withdraw" },
    { name: "Return", type: "ReturnToConsigner" },
    { name: "Top Up", type: "TopUp" },
  ];

  const navigateToTransactions = (type: any, index: number) => {
    setActiveTab(type);

    // Scroll to the selected tab
    if (horizontalScrollRef.current) {
      // Calculate scroll position to center the selected tab
      const tabWidth = screenWidth / 3; // Assuming we show 3 tabs at a time
      const scrollPosition = Math.max(
        0,
        index * tabWidth - screenWidth / 2 + tabWidth / 2
      );
      horizontalScrollRef.current.scrollTo({
        x: scrollPosition,
        animated: true,
      });
    }

    if (type === "") {
      router.push("WalletTransactionTab");
    } else {
      router.push({
        pathname: "WalletTransactionTab",
        params: { type },
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        // Fetch balance
        const balanceResponse = await axios.get(
          `https://kfsapis.azurewebsites.net/api/Wallet/GetWalletForCustomer`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (balanceResponse.data) {
          setBalance(balanceResponse.data);
        } else {
          console.warn("Balance data is null.");
          setBalance(null);
        }

        // Fetch recent transactions
        const transactionsResponse = await axios.get(
          `https://kfsapis.azurewebsites.net/api/Wallet/GetWalletTransactionsForCustomer?page-number=1&page-size=5`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (transactionsResponse.data && transactionsResponse.data.success) {
          setRecentTransactions(transactionsResponse.data.data || []);
        } else {
          console.warn(
            "Transaction data fetch failed:",
            transactionsResponse.data?.message
          );
          setError(
            transactionsResponse.data?.message || "Failed to load transactions"
          );
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatAmount = (amount: any) => {
    const absAmount = Math.abs(amount);

    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(absAmount);
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTransactionItem = (item: any) => {
    const isCredit = item.type === "Refund" || item.amount > 0;

    return (
      <View key={item.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row">
          <View className="mr-4 justify-center">
            <View
              className={`w-12 h-12 rounded-full justify-center items-center ${
                isCredit ? "bg-green-500" : "bg-red-400"
              }`}
            >
              <Ionicons
                name={isCredit ? "arrow-down" : "arrow-up"}
                size={24}
                color="white"
              />
            </View>
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-1 pr-4">
                <Text
                  className="text-lg font-semibold text-gray-800"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.type}
                </Text>
                <Text
                  className="text-xs text-gray-500"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.description || "No description"}
                </Text>
              </View>
              <View className="shrink-0">
                <Text
                  className={`text-lg font-bold ${
                    isCredit ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isCredit ? "+" : "-"} {formatAmount(Math.abs(item.amount))} đ
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500">
                {formatDate(item.createdAt)}
              </Text>
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-1 ${
                    item.status === "Completed"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                />
                <Text className="text-gray-600">{item.status}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="p-4">
          <View className="flex-row items-center px-4 py-3 bg-white">
            <TouchableOpacity
              onPress={() => router.push("/(components)/Wallet")}
              className="mr-4 p-1"
            >
              <Entypo name="chevron-thin-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-900">My Wallet</Text>
          </View>

          {/* Balance Card */}
          <View className="bg-blue-500 rounded-xl p-6 mb-6">
            <Text className="text-white text-xl mb-1">Total Balance</Text>
            <Text className="text-white text-4xl font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "decimal",
                maximumFractionDigits: 0,
              }).format(balance?.availableBalance || 0)}{" "}
              đ
            </Text>
          </View>

          {/* Transaction Categories */}
          <Text className="text-xl font-semibold mb-3 text-gray-800">
            Transaction History
          </Text>
        </View>

        {/* Horizontal Scrollable Tab Buttons */}
        <View className="mb-6">
          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 5, paddingRight: 15 }}
          >
            {transactionTypes.map((item, index) => {
              const isActive = activeTab === item.type;

              return (
                <TouchableOpacity
                  key={index}
                  className={`py-4 px-4 mx-1 min-w-20 ${
                    isActive ? "bg-white" : "bg-gray-100"
                  } border-b-2 ${
                    isActive ? "border-blue-500" : "border-transparent"
                  } rounded-t-lg`}
                  onPress={() => navigateToTransactions(item.type, index)}
                >
                  <Text
                    className={`text-center font-medium ${
                      isActive ? "text-blue-500" : "text-gray-600"
                    }`}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {/* Shadow/gradient effect to indicate scrollable content */}
          <View className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
        </View>

        <View className="px-4 pb-6">
          {/* Recent Transactions Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => navigateToTransactions("", 0)}>
              <Text className="text-blue-500 font-medium text-lg">See All</Text>
            </TouchableOpacity>
          </View>

          {/* Loading state */}
          {loading && (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#007BFF" />
              <Text className="mt-2 text-gray-600">
                Loading transactions...
              </Text>
            </View>
          )}

          {/* Error state */}
          {error && !loading && (
            <View className="py-8 items-center">
              <Ionicons name="alert-circle-outline" size={40} color="#FF6B6B" />
              <Text className="mt-2 text-gray-800">{error}</Text>
              <TouchableOpacity
                className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
                onPress={() => {
                  setLoading(true);
                  setError(null);
                  // Re-fetch would happen here in a real implementation
                }}
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No transactions state */}
          {!loading && !error && recentTransactions.length === 0 && (
            <View className="py-8 items-center">
              <Ionicons name="receipt-outline" size={48} color="#CCCCCC" />
              <Text className="mt-4 text-gray-500 text-lg">
                No transactions found
              </Text>
            </View>
          )}

          {/* Transactions list */}
          {!loading && !error && recentTransactions.length > 0 && (
            <View>
              {recentTransactions.map((item) => renderTransactionItem(item))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
