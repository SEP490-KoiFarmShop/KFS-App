import { View, FlatList, RefreshControl, ScrollView } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import ConsignItem from "@/components/ConsignItem";
import { ActivityIndicator, Text } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function TableScreen({ status }: any) {
  const [consignments, setConsignments] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const router = useRouter();

  const PAGE_SIZE = 10;

  const fetchConsignments = async (
    pageNumber = 1,
    showLoader = true,
    isLoadMore = false
  ) => {
    if (showLoader) setLoading(true);
    if (isLoadMore) setIsFetchingMore(true);

    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.get(
        "https://kfsapis.azurewebsites.net/api/Consignment/GetListOfConsignmentsForCustomer",
        {
          params: {
            status,
            "page-number": pageNumber,
            "page-size": PAGE_SIZE,
          },
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newData = response.data.data;

      if (isLoadMore) {
        setConsignments((prev: any) => [...prev, ...newData]);
      } else {
        setConsignments(newData);
      }

      setHasMore(newData.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching consignments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchConsignments(1);
  }, [status]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchConsignments(1, false);
  }, [status]);

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchConsignments(nextPage, false, true);
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  return (
    <View className="p-4 bg-gray-100 flex-1">
      {consignments.length === 0 ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF0000"]}
              tintColor="#FF0000"
            />
          }
        >
          <Text className="text-lg text-gray-500">NO CONSIGNMENT REQUEST</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={consignments}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }) => (
            <ConsignItem item={item} onRefresh={onRefresh} />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF0000"]}
              tintColor="#FF0000"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#FF0000" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
