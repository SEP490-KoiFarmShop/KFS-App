import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import Entypo from "@expo/vector-icons/Entypo";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const Tab = createMaterialTopTabNavigator();

// Component for Past Bids
function PastBidsScreen() {
  const [bids, setBids] = useState<any>([]);
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  useEffect(() => {
    fetchBids();
  }, [page, searchValue]);

  const fetchBids = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }
      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;
      const response = await axios.get(
        `https://kfsapis.azurewebsites.net/api/v1/bids/past/customer?search-value=${searchValue}&page-number=${page}&page-size=10`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const newBids = response.data.data;
        if (page === 1) {
          setBids(newBids);
        } else {
          setBids((prevBids: any) => [...prevBids, ...newBids]);
        }

        setHasMore(newBids.length === 10);
      }
    } catch (error) {
      console.error("Error fetching past bids:", error);
    }
    setLoading(false);
  };

  const loadMore = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleSearchSubmit = () => {
    setBids([]);
    setSearchValue(tempSearch);
    setPage(1);
    setHasMore(true);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/(components)/LotDetailScreen?lotId=${item.lotId}`)
      }
    >
      <View
        className={`p-4 m-2 rounded-lg flex-row items-center shadow-md ${
          item.isWinner ? "bg-green-200" : "bg-white"
        }`}
      >
        <Image
          source={{ uri: item.imageUrl }}
          className="w-16 h-16 rounded-lg"
        />
        <View className="ml-4 flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-600">
            Max Bid Amount: {item?.yourMaxBid?.toLocaleString()} VND
          </Text>
          <Text
            className={`text-sm font-medium ${
              item.status === "Sold" ? "text-red-500" : "text-green-500"
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between mx-4 my-3">
        <TextInput
          className="w-[80%] p-3 bg-white border rounded-lg"
          placeholder="Tìm kiếm đấu giá..."
          value={tempSearch}
          onChangeText={setTempSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity
          className="w-[18%] p-3 bg-blue-500 rounded-lg justify-center items-center"
          onPress={handleSearchSubmit}
        >
          <Text className="text-white font-semibold">Tìm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bids}
        keyExtractor={(item, index) => `${item.lotId}-${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 justify-center items-center p-10">
              <Text className="text-gray-500 text-lg">
                Không có đấu giá nào
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
      />
    </View>
  );
}

// Component for Current Bids
function CurrentBidsScreen() {
  const [bids, setBids] = useState<any>([]);
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  useEffect(() => {
    fetchBids();
  }, [page, searchValue]);

  const fetchBids = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }
      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;
      const response = await axios.get(
        `https://kfsapis.azurewebsites.net/api/v1/bids/current/customer?search-value=${searchValue}&page-number=${page}&page-size=10`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const newBids = response.data.data;
        if (page === 1) {
          setBids(newBids);
        } else {
          setBids((prevBids: any) => [...prevBids, ...newBids]);
        }

        setHasMore(newBids.length === 10);
      }
    } catch (error) {
      console.error("Error fetching current bids:", error);
    }
    setLoading(false);
  };

  const loadMore = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleSearchSubmit = () => {
    setBids([]);
    setSearchValue(tempSearch);
    setPage(1);
    setHasMore(true);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/(components)/LotDetailScreen?lotId=${item.lotId}`)
      }
    >
      <View className="p-4 m-2 rounded-lg flex-row items-center shadow-md bg-white">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-16 h-16 rounded-lg"
        />
        <View className="ml-4 flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-600">
            Max Bid Amount: {item?.yourMaxBid?.toLocaleString()} VND
          </Text>
          <Text className="text-sm text-gray-600">
            Current Price: {item?.currentPrice?.toLocaleString()} VND
          </Text>
          <Text className="text-sm font-medium text-blue-500">
            Ends: {new Date(item?.expectedEndTime)?.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between mx-4 my-3">
        <TextInput
          className="w-[80%] p-3 bg-white border rounded-lg"
          placeholder="Tìm kiếm đấu giá..."
          value={tempSearch}
          onChangeText={setTempSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity
          className="w-[18%] p-3 bg-blue-500 rounded-lg justify-center items-center"
          onPress={handleSearchSubmit}
        >
          <Text className="text-white font-semibold">Tìm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bids}
        keyExtractor={(item, index) => `${item.lotId}-${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 justify-center items-center p-10">
              <Text className="text-gray-500 text-lg">
                Không có đấu giá nào
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
      />
    </View>
  );
}

export default function AuctionHistoryScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center p-5 bg-white shadow-md">
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/profile`)}
          className="p-2 rounded-full bg-gray-100"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-bold">Bid History</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#0066cc",
          tabBarInactiveTintColor: "#666666",
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "bold",
            textTransform: "none",
          },
          tabBarStyle: { backgroundColor: "white" },
          tabBarIndicatorStyle: { backgroundColor: "#0066cc", height: 3 },
        }}
      >
        <Tab.Screen
          name="CurrentBids"
          component={CurrentBidsScreen}
          options={{ tabBarLabel: "Auctioning" }}
        />
        <Tab.Screen
          name="PastBids"
          component={PastBidsScreen}
          options={{ tabBarLabel: "End" }}
        />
      </Tab.Navigator>
    </View>
  );
}
