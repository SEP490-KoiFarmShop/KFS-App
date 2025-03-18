import { View, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import ConsignItem from "@/components/ConsignItem";
import { ActivityIndicator, Text } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function TableScreen({ status }: any) {
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchConsignments = async () => {
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
              "page-number": 1,
              "page-size": 10,
            },
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Data:", status);
        setConsignments(response.data);
      } catch (error) {
        console.error("Error fetching consignments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsignments();
  }, [status]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  return (
    <View className="p-4 bg-gray-100 flex-1">
      {consignments.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-500">Không có đơn ký gửi</Text>
        </View>
      ) : (
        <FlatList
          data={consignments}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }) => <ConsignItem item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
