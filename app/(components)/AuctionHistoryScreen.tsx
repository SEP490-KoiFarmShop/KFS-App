import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import Entypo from "@expo/vector-icons/Entypo";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";

const Tab = createMaterialTopTabNavigator();

// Bid Item Component to reduce duplication
const BidItem = ({ item, onPress, isPastBid = false }: any) => {
  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isWinner = item.isWinner;

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        className={`p-4 m-2 rounded-xl flex-row bg-white shadow-sm border border-gray-100`}
      >
        <Image
          source={{ uri: item.imageUrl }}
          className="w-20 h-20 rounded-lg"
          resizeMode="cover"
        />
        <View className="ml-3 flex-1 justify-between">
          <View>
            <Text
              className="text-lg font-semibold text-gray-800 mb-1"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text className="text-sm text-gray-600">
              Your bid:{" "}
              <Text className="font-bold">
                {item?.yourMaxBid?.toLocaleString()} VND
              </Text>
            </Text>

            {!isPastBid && (
              <Text className="text-sm text-gray-600 mt-1">
                Current price:{" "}
                <Text className="font-bold">
                  {item?.currentPrice?.toLocaleString()} VND
                </Text>
              </Text>
            )}
          </View>

          <View className="flex-row justify-between items-center mt-2">
            {isPastBid ? (
              isWinner ? (
                <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-full">
                  <FontAwesome5 name="trophy" size={14} color="#16a34a" />
                  <Text className="ml-1 text-green-600 font-bold">You Win</Text>
                </View>
              ) : (
                <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
                  <Text
                    className={`text-sm font-medium ${
                      item.status === "Sold" ? "text-red-500" : "text-gray-600"
                    }`}
                  >
                    {item.status}
                  </Text>
                </View>
              )
            ) : (
              <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
                <AntDesign name="clockcircle" size={14} color="#0066cc" />
                <Text className="ml-1 text-blue-600 text-xs">
                  Ends: {formatDate(item?.expectedEndTime)}
                </Text>
              </View>
            )}

            <TouchableOpacity className="p-1">
              <AntDesign name="right" size={16} color="#0066cc" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Search bar component to avoid repetition
const SearchBar = ({ value, onChangeText, onSubmit }: any) => (
  <View className="flex-row items-center justify-between mx-4 my-3">
    <View className="flex-row items-center bg-white rounded-lg flex-1 border border-gray-200">
      <Feather
        name="search"
        size={18}
        color="#666"
        className="ml-3"
        style={{ marginLeft: 10 }}
      />
      <TextInput
        className="flex-1 p-3 pl-2"
        placeholder="Search auctions..."
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
    </View>
  </View>
);

// Component for Past Bids
function PastBidsScreen() {
  const [bids, setBids] = useState<any[]>([]);
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
          setBids((prevBids) => [...prevBids, ...newBids]);
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

  return (
    <View className="flex-1 bg-gray-50">
      <SearchBar
        value={tempSearch}
        onChangeText={setTempSearch}
        onSubmit={handleSearchSubmit}
      />

      <FlatList
        data={bids}
        keyExtractor={(item, index) => `${item.lotId}-${index}`}
        renderItem={({ item }) => (
          <BidItem
            item={item}
            onPress={() =>
              router.push(`/(components)/LotDetailScreen?lotId=${item.lotId}`)
            }
            isPastBid={true}
          />
        )}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 justify-center items-center p-10">
              <AntDesign name="inbox" size={48} color="#ccc" />
              <Text className="text-gray-500 text-lg mt-3">
                No auctions found
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#0066cc" /> : null
        }
      />
    </View>
  );
}

// Component for Current Bids
function CurrentBidsScreen() {
  const [bids, setBids] = useState([]);
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
          setBids((prevBids): any => [...prevBids, ...newBids]);
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

  return (
    <View className="flex-1 bg-gray-50">
      <SearchBar
        value={tempSearch}
        onChangeText={setTempSearch}
        onSubmit={handleSearchSubmit}
      />

      <FlatList
        data={bids}
        keyExtractor={(item: any, index) => `${item.lotId}-${index}`}
        renderItem={({ item }) => (
          <BidItem
            item={item}
            onPress={() =>
              router.push(`/(components)/LotDetailScreen?lotId=${item.lotId}`)
            }
            isPastBid={false}
          />
        )}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 justify-center items-center p-10">
              <AntDesign name="inbox" size={48} color="#ccc" />
              <Text className="text-gray-500 text-lg mt-3">
                No active auctions
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#0066cc" /> : null
        }
      />
    </View>
  );
}

export default function AuctionHistoryScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View className="px-4 pt-12 pb-4 bg-white shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/profile`)}
            className="p-2 rounded-full bg-gray-100"
          >
            <Entypo name="chevron-thin-left" size={22} color="#333" />
          </TouchableOpacity>
          <Text className="ml-3 text-xl font-bold text-gray-800">
            Auction History
          </Text>
        </View>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#0066cc",
          tabBarInactiveTintColor: "#666666",
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "600",
            textTransform: "none",
          },
          tabBarStyle: {
            backgroundColor: "white",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: "#f0f0f0",
          },
          tabBarIndicatorStyle: {
            backgroundColor: "#0066cc",
            height: 3,
            borderRadius: 3,
          },
        }}
      >
        <Tab.Screen
          name="CurrentBids"
          component={CurrentBidsScreen}
          options={{ tabBarLabel: "Active Auctions" }}
        />
        <Tab.Screen
          name="PastBids"
          component={PastBidsScreen}
          options={{ tabBarLabel: "Completed" }}
        />
      </Tab.Navigator>
    </View>
  );
}
