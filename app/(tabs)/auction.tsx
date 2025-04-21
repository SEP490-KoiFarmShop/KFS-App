import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import AuctionItem from "@/components/AuctionItem";
import GlobalApi from "@/utils/GlobalApi";
import AuctionSearch from "@/components/AuctionSearch";

interface Auction {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  status: string;
  startTime: string;
  expectedEndTime: string;
  actualEndTime: string;
  totalLots: number;
}

const auction = () => {
  const router = useRouter();
  const numColumns = 1;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [auctionList, setAuctionList] = useState<Auction[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    setPage(1);
    fetchAuctionList(1, searchValue, sortOrder, true);
  }, [searchValue, sortOrder]);

  const fetchAuctionList = async (
    pageNumber = 1,
    search = "",
    sortOrder = "",
    isSearch = false
  ) => {
    if ((loading && !refreshing) || (!hasNextPage && !isSearch)) return;
    setLoading(true);
    try {
      const response = await GlobalApi.getAuctionList(
        pageNumber,
        10,
        search,
        sortOrder
      );
      if (response?.data?.length > 0) {
        setAuctionList((prevList) =>
          isSearch || refreshing
            ? response.data
            : [...prevList, ...response.data]
        );
        setPage(pageNumber);
        setHasNextPage(response.hasNext);
      } else {
        if (isSearch || refreshing) setAuctionList([]);
        setHasNextPage(false);
      }
    } catch (error: any) {
      console.error("Error fetching auction list:", error);
      alert("Lỗi API: " + error.message);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchAuctionList(1, searchValue, sortOrder, true);
  }, [searchValue, sortOrder]);

  return (
    <View className="flex-1">
      <View className="flex-row justify-start">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white p-2 rounded-tr-2xl rounded-bl-2xl ml-4 mt-5"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="mt-6 ml-2 text-2xl font-semibold">Koi Auction</Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="bg-white p-2 rounded-tr-2xl rounded-bl-2xl ml-auto mr-4 mt-5"
        >
          <Entypo name="cycle" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        key={`flatlist-${numColumns}`}
        keyExtractor={(item) => item.id.toString()}
        data={auctionList}
        numColumns={numColumns}
        ListHeaderComponent={
          <AuctionSearch
            onSearch={(search: any) => {
              setSearchValue(search);
              setSortOrder(sortOrder);
            }}
          />
        }
        renderItem={({ item }) => <AuctionItem auction={item} />}
        onEndReached={() => {
          if (hasNextPage) {
            fetchAuctionList(page + 1, searchValue, sortOrder);
          }
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[MD2Colors.red800]}
          />
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <View className="justify-center items-center p-4">
              <ActivityIndicator animating={true} color={MD2Colors.red800} />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default auction;
