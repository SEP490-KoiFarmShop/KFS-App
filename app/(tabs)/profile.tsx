import { Image, ScrollView, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import DuyApi from "@/utils/DuyApi";

const profile = () => {
  interface User {
    userId: string;
    username: string;
    email: string;
    phoneNumber: string;
    address: string;
    loyaltyPoints: number;
    walletBalance: number;
    avatarUrl: string;
  }

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await DuyApi.getAppUsers();
        console.log("User data:", JSON.stringify(response, null, 2)); // Debug

        const users = response?.appUsers; // Lấy danh sách user từ API
        if (users && users.length > 0) {
          setUser(users[0]); // Gán user đầu tiên vào state
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <ScrollView>
      <View className="items-center mt-3">
        <Heading text="Edit Profile" />
        <Image
          source={{ uri: user?.avatarUrl }}
          className="w-36 h-36 rounded-full"
        />
      </View>
    </ScrollView>
  );
};

export default profile;
