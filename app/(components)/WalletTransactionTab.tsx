import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";

export default function WalletTransactionTab() {
  const [transactions, setTransactions] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<any>(null);
  const router = useRouter();
  const { type } = useLocalSearchParams();

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, type]);

  const fetchTransactions = async (page: any) => {
    setLoading(true);
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) {
      router.push("/(auth)/LoginScreen");
      return;
    }
    const parsedToken = JSON.parse(userData);
    const jwtToken = parsedToken?.accessToken;

    try {
      // Add type parameter to the URL if it exists
      const typeParam = type ? `&Type=${type}` : "";
      const response = await fetch(
        `https://kfsapis.azurewebsites.net/api/Wallet/GetWalletTransactionsForCustomer?page-number=${page}&page-size=10${typeParam}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
        setTotalPages(data.totalPages);
      } else {
        setError(data.message || "Failed to load transactions");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: any) => {
    const absAmount = Math.abs(amount);

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
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

  const renderTransactionItem = ({ item }: any) => {
    const isCredit = item.type === "Refund" || item.amount > 0;

    return (
      <View className="flex-row bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="mr-4 justify-center">
          <View
            className={`w-9 h-9 rounded-full justify-center items-center ${
              isCredit ? "bg-green-500" : "bg-red-400"
            }`}
          >
            <Ionicons
              name={isCredit ? "arrow-down" : "arrow-up"}
              size={18}
              color="white"
            />
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between mb-2">
            <View className="flex-1 mr-2">
              <Text className="text-base font-semibold text-gray-800">
                {item.type}
              </Text>
              <Text className="text-xs text-gray-500 flex-wrap">
                {item.description || "No description"}
              </Text>
            </View>
            <View>
              <Text
                className={`text-base font-bold ${
                  isCredit ? "text-green-500" : "text-red-500"
                }`}
              >
                {isCredit ? "+" : "-"} {formatAmount(Math.abs(item.amount))}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-gray-500">
              {formatDate(item.createdAt)}
            </Text>
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-1 ${
                  item.status === "Completed" ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
              <Text className="text-xs text-gray-600">{item.status}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View className="flex-row justify-between items-center py-4">
        <TouchableOpacity
          className={`w-10 h-10 rounded-full justify-center items-center ${
            currentPage <= 1 ? "opacity-50" : ""
          }`}
          onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentPage <= 1 ? "#CCCCCC" : "#007BFF"}
          />
        </TouchableOpacity>

        <Text className="text-sm text-gray-600">
          Page {currentPage} of {totalPages || 1}
        </Text>

        <TouchableOpacity
          className={`w-10 h-10 rounded-full justify-center items-center ${
            currentPage >= totalPages ? "opacity-50" : ""
          }`}
          onPress={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
          disabled={currentPage >= totalPages}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentPage >= totalPages ? "#CCCCCC" : "#007BFF"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const getHeaderTitle = () => {
    if (!type) return "All Transactions";
    return `${type} Transactions`;
  };

  if (loading && transactions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <ActivityIndicator size="large" color="#007BFF" />
        <Text className="mt-4 text-gray-600">Loading transactions...</Text>
      </View>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text className="mt-2 text-gray-800 text-base">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
          onPress={() => fetchTransactions(currentPage)}
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity
        className="flex-row items-center mb-4"
        onPress={() => router.push("Wallet")}
      >
        <Entypo name="chevron-thin-left" size={24} color="black" />
        <Text className="text-2xl font-bold mb-1 ml-2 text-gray-900">
          {getHeaderTitle()}
        </Text>
      </TouchableOpacity>

      {transactions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="receipt-outline" size={64} color="#CCCCCC" />
          <Text className="mt-4 text-gray-500 text-lg">
            No transactions found
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={() => fetchTransactions(currentPage)}
          />
          {renderFooter()}
        </>
      )}
    </View>
  );
}
