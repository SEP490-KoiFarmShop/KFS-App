import { View, Text, FlatList, RefreshControl } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import OrderItem from "@/components/OrderItem";
import { canGoBack } from "expo-router/build/global-state/routing";

export default function OrderTable({ status }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = async (page = 1, isRefreshing = false) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const url = `https://kfsapis.azurewebsites.net/api/v1/orders/customer`;
      const params: any = {
        "page-number": page,
        "page-size": 10,
      };
      if (status) params.status = status;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        params,
      });

      if (isRefreshing) {
        setOrders(response.data.data);
      } else {
        setOrders((prevOrders) => [...prevOrders, ...response.data.data]);
      }

      setHasNext(response.data.hasNext);
      setPageNumber(page);
    } catch (error) {
      console.error("Error fetching Orders:", error);
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders(1, true);
  }, [status]);

  const loadMoreOrders = () => {
    if (hasNext && !loading) {
      fetchOrders(pageNumber + 1);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(1, true);
  }, []);

  if (loading && pageNumber === 1) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  return (
    <View className="p-4 bg-gray-100 flex-1">
      {orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-500">Không có hàng</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }) => <OrderItem item={item} />}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            hasNext ? <ActivityIndicator size="small" color="#FF0000" /> : null
          }
        />
      )}
    </View>
  );
}
