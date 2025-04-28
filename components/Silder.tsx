import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import GlobalApi from "@/utils/GlobalApi";
import Heading from "./Heading";
import { useRouter } from "expo-router";

const Silder = () => {
  const [sliders, setSliders] = useState<any>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await GlobalApi.getSlider();
        const imageList = response.flatMap((item: any) =>
          (item.imageUrls || []).map((url: string) => ({
            title: item.title,
            imageUrl: url,
            id: item.id,
          }))
        );
        setSliders(imageList);
      } catch (error: any) {
        console.error("Error fetching sliders:", error.response.data.Message);
      }
    };

    fetchSliders();
  }, []);

  const isValidUrl = (url: string) => {
    return typeof url === "string" && url.startsWith("https://");
  };

  return (
    <View className="mb-8">
      <Heading text={"Blogs for you"} />
      <FlatList
        data={sliders}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mr-5 rounded-2xl overflow-hidden shadow-md bg-white"
            onPress={() => router.push(`/BlogDetail?id=${item.id}`)}
          >
            <Image
              className="w-[270] h-[150] rounded-t-2xl"
              resizeMode="cover"
              source={
                isValidUrl(item.imageUrl)
                  ? { uri: item.imageUrl }
                  : // : require("../assets/icon/defaultsilder.jpg")
                    require("../assets/icon/defaultsilder.jpg")
              }
            />
            <View className="px-3 py-2 bg-white w-[270]">
              <Text
                className="text-gray-800 font-medium text-sm"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.title || "Special Offer"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Silder;
