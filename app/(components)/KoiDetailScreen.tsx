import { View, Text, Image, ScrollView, TouchableOpacity, Alert, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import GlobalApi from "@/utils/GlobalApi";
import CustomButton from "@/components/CustomButton";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Koi {
  id: string;
  name: string;
  sex: string;
  description: string;
  size: string;
  price: number;
  breeder: string;
  bornDate: string;
  image: { url: string }[];
  category: { name: string };
  varieties: string;
  status: string;
}

export default function KoiDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [koisById, setKoisById] = useState<Koi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width;

  const submit = async () => {
    try {
      const token = await AsyncStorage.getItem("userData");

      if (!token) {
        Alert.alert("Error", "You need to login first!");
        return;
      }

      const parsedToken = JSON.parse(token);
      const jwtToken = parsedToken?.accessToken;
      // console.log(koisById?.id)
      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/koi-fishes/cart",
        {
          koiFishId: koisById?.id
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        Alert.alert("Success", "Koi fish added to cart!");
        // router.push(`/Cart`);
      }
    } catch (error) {
      console.error("Error adding koi to cart:", error);
      Alert.alert("Error", "Failed to add koi to cart.");
    }
  };

  useEffect(() => {
    const fetchKoiDetail = async () => {
      try {
        const apiData = await GlobalApi.getKoisById(id);
        // console.log("API Response:", apiData);

        if (!apiData || Object.keys(apiData).length === 0) {
          // console.warn("No Koi found for ID:", id); 
          setKoisById(null);
          return;
        }

        const formattedKoi: Koi = {
          id: apiData.id?.toString() || "",
          name: apiData.name || "Unknown",
          sex: apiData.gender || "Unknown",
          description: apiData.description || "No description available",
          size: apiData.size || "Unknown",
          price: apiData.price || 0,
          breeder: apiData.breeders || "Unknown",
          image: apiData.imageUrl ? [{ url: apiData.imageUrl }] : [{ url: require('../../assets/icon/defaultimage.jpg') }],
          category: { name: apiData.type || "Unknown" },
          bornDate: apiData.bornDate || "Unknown",
          varieties: apiData.varieties || "Unknown",
          status: apiData.status || "Unknown",
        };

        setKoisById(formattedKoi);
      } catch (error) {
        console.error("Error fetching koi details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKoiDetail();
  }, [id]);

  if (isLoading) {
    return (
      <View className="justify-center items-center flex-1">
        <ActivityIndicator animating={true} color={MD2Colors.red800} />
      </View>
    );
  }

  if (!koisById) {
    return (
      <View className="justify-center items-center flex-1">
        <Text className="text-gray-500">No data available</Text>
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1">
      <View className="flex-row">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(koisById.image.length > 0 ? koisById.image : [{ url: require("../../assets/icon/defaultimage.jpg") }])
            .map((img, index) => (
              <Image
                key={index}
                className="w-[250px] h-[300px] mt-5 mr-5"
                source={typeof img.url === "string" ? { uri: img.url } : img.url}
                resizeMode="contain"
              />
            ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="m-5">
          <Text className="font-bold text-2xl text-black ml-5">
            {koisById.name}
          </Text>
          <Text className="font-semibold text-orange-600 mt-3 text-xl ml-5">
            {formatPrice(koisById.price)} VNĐ
          </Text>
          <Text className="text-gray-500 mt-5">- {koisById.description}</Text>
          <Text className="font-semibold text-xl mt-5">
            Detail Information of {koisById.name} :
          </Text>
          <View className="mt-3 mb-3">
            <Text className="text-gray-700 text-lg">💰 Type sell: {koisById.category.name}</Text>
            <Text className="text-gray-700 text-lg">♂️ Gender: {koisById.sex}</Text>
            <Text className="text-gray-700 text-lg">📏 Size: {koisById.size} cm</Text>
            <Text className="text-gray-700 text-lg">📅 Born Date: {formatDate(koisById.bornDate)}</Text>
            <Text className="text-gray-700 text-lg">
              ✅ Status: <Text className="text-green-500 text-lg font-bold">{koisById.status}</Text>
            </Text>
            <Text className="text-gray-700 text-lg">🎨 Varieties: {koisById.varieties}</Text>

          </View>
          <Text className="font-black text-xl mt-2">Source:</Text>
          <TouchableOpacity
            onPress={() =>
              router.push(`/KoiByBreeder?breeder=${koisById.breeder}`)
            }
          >
            <Text className="text-blue-600 text-xl mt-1 font-medium">
              {koisById.breeder}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View>
        <CustomButton
          title="Add To Cart"
          handlePress={submit}
          containerStyles="mt-10 mb-5 bg-orange-500 h-14 mr-5 ml-5"
          isLoading={false}
        />
      </View>
    </View>
  );
}
