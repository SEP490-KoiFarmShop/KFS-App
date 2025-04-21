import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import Heading from "./Heading";
import GlobalApi from "@/utils/GlobalApi";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DetailKoiItem from "./DetailKoiItem";

export default function LatestKoi() {
  const [kois, setKois] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await GlobalApi.getKois();
        console.log("test: ", response);
        setKois(response);
      } catch (error) {
        console.error("Error fetching kois:", error);
      }
    };
    fetchCategories();
  }, []);

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        className="mr-5"
        onPress={() => router.push(`/KoiDetailScreen?id=${item.id}`)}
      >
        <DetailKoiItem koi={item} />
      </TouchableOpacity>
    );
  };

  const renderLoadMoreButton = () => {
    return (
      <TouchableOpacity
        className="mr-5 justify-center items-center"
        onPress={() => router.push("/KoiFishAll")}
      >
        <View className="w-20 h-20 bg-gray-300 rounded-full justify-center items-center mt-24">
          <Ionicons name="chevron-forward" size={30} color="#555" />
        </View>
        <Text className="mt-2 text-center text-gray-600">View More</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="mt-10">
      <Heading
        text={"Latest Koi for you"}
        isViewAll={true}
        onViewAllPress={() => router.push(`/KoiFishAll`)}
      />
      <FlatList
        data={kois}
        keyExtractor={(item: any) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        ListFooterComponent={renderLoadMoreButton}
      />
    </View>
  );
}
