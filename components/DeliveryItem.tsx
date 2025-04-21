import { View, Text, FlatList, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import CustomButton from "./CustomButton";
import { router } from "expo-router";

export default function DeliveryItem({ status }: any) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const fetchDeliveries = useCallback(
    async (reset = false) => {
      try {
        if (!reset) setLoading(true);

        const userData = await AsyncStorage.getItem("userData");
        const parsedToken = JSON.parse(userData || "{}");
        const jwtToken = parsedToken?.accessToken;

        const currentPage = reset ? 1 : page;

        console.log("Fetching deliveries: ", {
          status,
          page: currentPage,
          pageSize,
        });

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/deliveries/shipper?status=${status}&page-number=${currentPage}&page-size=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response status:", response.status);

        if (response.data.success) {
          const newData = response.data.data;
          if (reset) {
            setDeliveries(newData);
          } else {
            setDeliveries((prev) => [...prev, ...newData]);
          }

          if (newData.length < pageSize) {
            setHasMore(false);
          }
        }
      } catch (err: any) {
        console.error("Error fetching deliveries:", err.message);
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
        }
      } finally {
        setLoading(false);
        if (reset) setRefreshing(false);
      }
    },
    [page, status]
  );

  useEffect(() => {
    setPage(1);
    setDeliveries([]);
    setHasMore(true);
  }, [status]);

  useEffect(() => {
    fetchDeliveries(true); // initial fetch
  }, [fetchDeliveries]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchDeliveries(true);
  };

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchDeliveries();
    }
  }, [page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "text-yellow-500";
      case "Delivering":
        return "text-blue-500";
      case "Delivered":
        return "text-green-500";
      case "DeliveryFailed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const handleConfirm = async (item: any) => {
    router.push(`/(delivery)/DeliveryDetail?deliveryId=${item.deliveryId}`);
  };

  const renderItem = ({ item }: any) => (
    <View className="bg-white border border-gray-200 p-5 mb-4 rounded-2xl shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-800">
          Delivery #{item.deliveryId}
        </Text>
        <FontAwesome name="truck" size={20} color="gray" />
      </View>
      <Text className="text-sm text-gray-500 mb-1">
        Order ID: <Text className="font-medium text-black">{item.orderId}</Text>
      </Text>
      <Text className="text-sm mb-1">
        Type:{" "}
        <Text className="font-medium text-gray-700">{item.orderType}</Text>
      </Text>
      <Text className="text-sm mb-1">
        Assigned:{" "}
        <Text className="text-gray-600">
          {new Date(item.assignedTime).toLocaleString()}
        </Text>
      </Text>
      <View className="flex-row justify-between items-center mt-2">
        <Text
          className={`text-sm font-semibold mt-1 ${getStatusColor(
            item.status
          )}`}
        >
          Status: {item.status}
        </Text>
        <CustomButton
          title="✔ View Details"
          handlePress={() => handleConfirm(item)}
          containerStyles="bg-green-500 h-12 px-6 rounded-full shadow-md"
        />
      </View>
    </View>
  );

  if (loading && deliveries.length === 0) {
    return (
      <View className="flex-1 justify-center items-center mt-10">
        <ActivityIndicator size="large" color="red" />
        <Text className="mt-2 text-gray-500">Loading deliveries...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={deliveries}
      keyExtractor={(item) => item.deliveryId.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      ListFooterComponent={
        hasMore ? (
          <ActivityIndicator
            size="small"
            color="gray"
            style={{ marginBottom: 20 }}
          />
        ) : (
          <Text className="text-center text-gray-400 mb-4">
            No more deliveries
          </Text>
        )
      }
    />
  );
}
