import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import GlobalApi from "@/utils/GlobalApi";
import Heading from "./Heading";
import { useRouter } from "expo-router";

export default function Categories() {
  const router = useRouter();
  const [categories, setCategories] = useState<any>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await GlobalApi.getVarieties();
        setCategories(response);
      } catch (error) {
        console.error("Error fetching varieties:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <View className="mt-5">
      <Heading text={"Variety"} isViewAll={false} />
      <FlatList
        data={categories}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View className="w-[75px] items-center mr-5">
            <TouchableOpacity
              onPress={() =>
                router.push(`/KoiFishAll?variety=${item.name.toLowerCase()}`)
              }
            >
              <Image
                className="w-[75px] h-[75px] rounded-full"
                resizeMode="contain"
                source={{ uri: item.imageUrl }}
              />
              <Text className="text-center mt-2">{item.name}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
