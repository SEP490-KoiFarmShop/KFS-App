import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import GlobalApi from "@/utils/GlobalApi";
import DetailKoiItem from "@/components/DetailKoiItem";
import SearchComponent from "@/components/Search";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import Entypo from "@expo/vector-icons/Entypo";
import { FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Koi {
  id: number;
  name: string;
  quantity: number;
  price: number;
  type: string;
  status: string;
  exchangeMethod: string;
  breeders: string;
  varieties: string;
  bornDate: string;
  size: number;
  gender: string;
}

export default function KoiFishAll() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<any>([]);
  const [cartItems, setCartItems] = useState<any>([]);
  const [koisList, setKoisList] = useState<Koi[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [searchValue, setSearchValue] = useState(
    params.search?.toString() || ""
  );
  const [variety, setVariety] = useState(params.variety?.toString() || "");
  const [gender, setGender] = useState("");
  const [type, setType] = useState("");
  const [breeder, setBreeder] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const numColumns = 2;
  const [selectedOption, setSelectedOption] = useState("Newest");
  const [priceSortOrder, setPriceSortOrder] = useState("asc");

  useEffect(() => {
    if (params.search) {
      setSearchValue(params.search.toString());
    }

    if (params.variety) {
      setVariety(params.variety.toString());
    }

    setPage(1);
    fetchKoisList(
      1,
      searchValue,
      gender,
      type,
      variety,
      breeder,
      sortOrder,
      true
    );
  }, [params.search, searchValue, gender, type, variety, breeder, sortOrder]);

  const fetchKoisList = async (
    pageNumber = 1,
    search = "",
    gender = "",
    type = "",
    variety = "",
    breeder = "",
    sortOrder = "",
    isSearch = false
  ) => {
    if ((loading && !refreshing) || (!hasNextPage && !isSearch)) return;
    setLoading(true);
    try {
      const response = await GlobalApi.getKoisList(
        pageNumber,
        10,
        search,
        gender,
        type,
        variety,
        breeder,
        sortOrder
      );
      if (response?.data?.length > 0) {
        setKoisList((prevList) =>
          isSearch || refreshing
            ? response.data
            : [...prevList, ...response.data]
        );
        setPage(pageNumber);
        setHasNextPage(response.hasNext);
      } else {
        if (isSearch || refreshing) setKoisList([]);
        setHasNextPage(false);
      }
    } catch (error: any) {
      console.error("Error fetching koi list:", error);
      alert("Lỗi API: " + error.message);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchValue("");
    setGender("");
    setType("");
    setVariety("");
    setBreeder("");
    fetchCart();
    setPage(1);
    fetchKoisList(1, "", "", "", "", "", sortOrder, true);
  }, [sortOrder]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userData");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      const parsedToken = JSON.parse(token);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.get(
        `https://kfsapis.azurewebsites.net/api/Cart/GetCartAndItemsInside`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.items) {
        setCart(response.data);
        setCartItems(response.data.items);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData !== null) {
          const parsedData = JSON.parse(userData);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center px-4 mt-5">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white p-2 rounded-tr-2xl rounded-bl-2xl"
          >
            <Entypo name="chevron-thin-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-2 text-2xl font-semibold">Koi Fish</Text>
        </View>

        <TouchableOpacity onPress={() => router.push("/Cart")}>
          <AntDesign name="shoppingcart" size={30} color="orange" />
          {isLoggedIn && cartItems.length > 0 && (
            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {cart.itemsNumber}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center border-b border-gray-300 px-4 py-2">
        <TouchableOpacity
          onPress={() => {
            setSelectedOption("Newest");
            setSortOrder("updatedAt desc");
          }}
          className="flex-1 items-center"
        >
          <Text
            className={
              selectedOption === "Newest"
                ? "text-red-500 font-semibold text-lg"
                : "text-gray-500 text-lg"
            }
          >
            Newest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedOption("Price");
            const newSortOrder =
              priceSortOrder === "asc" ? "price desc" : "price";
            setPriceSortOrder(priceSortOrder === "asc" ? "desc" : "asc");
            setSortOrder(newSortOrder);
          }}
          className="flex-1 flex-row items-center justify-center"
        >
          <Text
            className={
              selectedOption === "Price"
                ? "text-red-500 font-semibold text-lg"
                : "text-gray-500 text-lg"
            }
          >
            Price
          </Text>
          <FontAwesome
            name={priceSortOrder === "asc" ? "sort-asc" : "sort-desc"}
            size={20}
            color="gray"
            className="ml-2"
          />
        </TouchableOpacity>
      </View>
      <FlatList
        key={`flatlist-${numColumns}`}
        keyExtractor={(item) => item.id.toString()}
        data={koisList}
        numColumns={numColumns}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <SearchComponent
            initialSearchValue={searchValue}
            initialVariety={variety}
            isRefreshing={refreshing}
            onSearch={(
              search: any,
              gender: any,
              type: any,
              variety: any,
              breeder: any,
              sortOrder: any
            ) => {
              setSearchValue(search);
              setGender(gender);
              setVariety(variety);
              setBreeder(breeder);
              setType(type);
              setSortOrder(sortOrder);
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ flex: 1, marginRight: 10 }}
            onPress={() =>
              router.push(`/KoiDetailScreen?koiname=${item.name}&id=${item.id}`)
            }
          >
            <DetailKoiItem koi={item} />
          </TouchableOpacity>
        )}
        onEndReached={() => {
          if (hasNextPage) {
            fetchKoisList(
              page + 1,
              searchValue,
              gender,
              type,
              variety,
              breeder,
              sortOrder
            );
          }
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
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
}
