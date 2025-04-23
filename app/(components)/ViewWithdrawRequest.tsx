import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WithdrawRequest {
  id: number;
  customerId: number;
  customerName: string;
  walletId: number;
  amount: number;
  status: string;
  createdAt: string;
}

interface ApiResponse {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  success: boolean;
  message: string;
  data: WithdrawRequest[];
}

export default function ViewWithdrawRequest() {
  const router = useRouter();
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  });

  // Format currency in VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch withdraw requests
  const fetchWithdrawRequests = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError("");
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        const response = await axios.get<ApiResponse>(
          "https://kfsapis.azurewebsites.net/api/Wallet/GetWithdrawRequestForCustomer",
          {
            params: {
              "page-number": page,
              "page-size": 10,
              "order-by": "createdAt desc",
            },
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setWithdrawRequests(response.data.data);
          setPagination({
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            pageSize: response.data.pageSize,
            totalCount: response.data.totalCount,
            hasPrevious: response.data.hasPrevious,
            hasNext: response.data.hasNext,
          });
        } else {
          setError(
            response.data.message || "Failed to fetch withdraw requests"
          );
        }
      } catch (err) {
        setError("❌ Failed to fetch withdraw requests. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  // Load withdraw requests on mount
  useEffect(() => {
    fetchWithdrawRequests();
  }, [fetchWithdrawRequests]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchWithdrawRequests(newPage);
    }
  };

  // Get status color based on status string
  const getStatusColors = (
    status: string
  ): { bgColor: string; textColor: string; dotColor: string } => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          bgColor: "bg-amber-100",
          textColor: "text-amber-500",
          dotColor: "bg-amber-500",
        };
      // case "approved":
      //   return {
      //     bgColor: "bg-emerald-100",
      //     textColor: "text-emerald-600",
      //     dotColor: "bg-emerald-600",
      //   };
      case "rejected":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-500",
          dotColor: "bg-red-500",
        };
      case "completed":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-500",
          dotColor: "bg-green-500",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-500",
          dotColor: "bg-gray-500",
        };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-orange-500 pt-12 pb-4 rounded-b-3xl shadow-md">
        <View className="px-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Withdraw Requests
          </Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchWithdrawRequests(1);
            }}
          />
        }
      >
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center p-5 mt-12">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="mt-3 text-gray-500">
              Loading withdraw requests...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center p-5 mt-12">
            <Text className="mb-4 text-red-500 text-center">{error}</Text>
            <TouchableOpacity
              className="bg-orange-500 py-2 px-5 rounded-lg"
              onPress={() => fetchWithdrawRequests()}
            >
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : withdrawRequests.length === 0 ? (
          <View className="flex-1 justify-center items-center p-5 mt-24">
            <Ionicons name="document-outline" size={64} color="#d1d5db" />
            <Text className="mt-3 text-gray-500 text-base">
              No withdraw requests found
            </Text>
          </View>
        ) : (
          <View className="p-4">
            {/* Summary Card */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-700 mb-3">
                Withdraw Requests
              </Text>
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-500">
                    {pagination.totalCount}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Total Requests
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-orange-500">
                    {
                      withdrawRequests.filter(
                        (r) => r.status.toLowerCase() === "pending"
                      ).length
                    }
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Pending</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-red-500">
                    {
                      withdrawRequests.filter(
                        (r) => r.status.toLowerCase() === "rejected"
                      ).length
                    }
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Rejected</Text>
                </View>
                {/* <View className="items-center">
                  <Text className="text-2xl font-bold text-green-500">
                    {
                      withdrawRequests.filter(
                        (r) => r.status.toLowerCase() === "completed"
                      ).length
                    }
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Completed</Text>
                </View> */}
              </View>
            </View>

            {/* Requests List */}
            {withdrawRequests.map((request) => {
              const statusColors = getStatusColors(
                request.status.toLowerCase()
              );
              return (
                <View
                  key={request.id}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-gray-100 rounded-lg px-2 py-1">
                      <Text className="text-xs font-bold text-gray-500">
                        #{request.id}
                      </Text>
                    </View>
                    <View
                      className={`flex-row items-center rounded-full px-3 py-1 ${statusColors.bgColor}`}
                    >
                      <View
                        className={`w-2 h-2 rounded-full mr-1 ${statusColors.dotColor}`}
                      />
                      <Text
                        className={`text-xs font-bold ${statusColors.textColor}`}
                      >
                        {request.status}
                      </Text>
                    </View>
                  </View>

                  <View className="border-t border-gray-100 pt-3">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-500 text-sm">Amount:</Text>
                      <Text className="text-gray-700 font-medium text-sm">
                        {formatCurrency(request.amount)}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">Date:</Text>
                      <Text className="text-gray-700 font-medium text-sm">
                        {formatDate(request.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <View className="flex-row justify-center items-center py-5">
                <TouchableOpacity
                  className={`bg-white rounded-lg w-9 h-9 justify-center items-center shadow-sm ${
                    !pagination.hasPrevious ? "opacity-50" : ""
                  }`}
                  onPress={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevious}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={pagination.hasPrevious ? "#f97316" : "#d1d5db"}
                  />
                </TouchableOpacity>

                <Text className="mx-3 text-gray-500 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </Text>

                <TouchableOpacity
                  className={`bg-white rounded-lg w-9 h-9 justify-center items-center shadow-sm ${
                    !pagination.hasNext ? "opacity-50" : ""
                  }`}
                  onPress={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={pagination.hasNext ? "#f97316" : "#d1d5db"}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
