import { View, FlatList, TouchableOpacity, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import GlobalApi from "@/utils/GlobalApi";
import DetailKoiItem from "@/components/DetailKoiItem";
import SearchComponent from "@/components/Search";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import Entypo from "@expo/vector-icons/Entypo";
import { FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";

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

  const [koisList, setKoisList] = useState<Koi[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [searchValue, setSearchValue] = useState(
    params.search?.toString() || ""
  );
  const [variety, setVariety] = useState(params.variety?.toString() || "");
  const [gender, setGender] = useState("");
  const [type, setType] = useState("");
  // const [variety, setVariety] = useState("");
  const [breeder, setBreeder] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const numColumns = 2;
  const [selectedOption, setSelectedOption] = useState("Newest");
  const [priceSortOrder, setPriceSortOrder] = useState("asc");

  useEffect(() => {
    // Use the search value from URL params if available
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
    if (loading || (!hasNextPage && !isSearch)) return;
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
          isSearch ? response.data : [...prevList, ...response.data]
        );
        setPage(pageNumber);
        setHasNextPage(response.hasNext);
      } else {
        if (isSearch) setKoisList([]);
        setHasNextPage(false);
      }
    } catch (error: any) {
      console.error("Error fetching koi list:", error);
      alert("Lỗi API: " + error.message);
    }
    setLoading(false);
  };

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
            setSelectedOption("Giá");
            const newSortOrder =
              priceSortOrder === "asc" ? "price desc" : "price";
            setPriceSortOrder(priceSortOrder === "asc" ? "desc" : "asc");
            setSortOrder(newSortOrder);
          }}
          className="flex-1 flex-row items-center justify-center"
        >
          <Text
            className={
              selectedOption === "Giá"
                ? "text-red-500 font-semibold text-lg"
                : "text-gray-500 text-lg"
            }
          >
            Giá
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
        ListHeaderComponent={
          <SearchComponent
            initialSearchValue={searchValue}
            initialVariety={variety}
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
          loading ? (
            <View className="justify-center items-center p-4">
              <ActivityIndicator animating={true} color={MD2Colors.red800} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
