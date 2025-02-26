import { Image, ScrollView, Text, TextInput, View } from "react-native";
import React, { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import DuyApi from "@/utils/DuyApi";
import CustomButton from "@/components/CustomButton";

const profile = () => {
  interface User {
    userId: string;
    username: string;
    email: string;
    password: string;
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
      <View>
        <Text className="text-lg font-bold mb-2">Name</Text>
        <TextInput
          className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9"
          placeholder={user?.username}
          style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
        />
        <Text className="text-lg font-bold mb-2">Email</Text>
        <TextInput
          className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9"
          placeholder={user?.email}
          style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
        />
        <Text className="text-lg font-bold mb-2">Passsword</Text>
        <TextInput
          className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9"
          placeholder="*******************"
          secureTextEntry={true}
          style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
        />
        <Text className="text-lg font-bold mb-2">Phone number</Text>
        <TextInput
          className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9"
          placeholder={user?.phoneNumber}
          style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
        />
      </View>
      <View className="mb-4 ml-2 flex-1">
        <CustomButton
          title="Submit and Publish"
          handlePress={() => {
            console.log("Profile updated");
          }}
          containerStyles="mt-5 bg-orange-500 h-14"
          isLoading={false}
        />
      </View>
      <View className="flex-row">
        <View className="mb-4 ml-2 flex-1">
          <CustomButton
            title="Auction history"
            handlePress={() => {
              console.log("Go to auction history");
            }}
            containerStyles="mt-5 bg-blue-500 h-14"
            isLoading={false}
          />
        </View>
        <View className="mb-4 ml-2 flex-1">
          <CustomButton
            title="Transaction history"
            handlePress={() => {
              console.log("Go to trans");
            }}
            containerStyles="mt-5 bg-blue-500 h-14"
            isLoading={false}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default profile;
