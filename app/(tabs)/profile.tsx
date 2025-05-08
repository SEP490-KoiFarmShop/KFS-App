import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import {
  FontAwesome,
  MaterialIcons,
  Entypo,
  Feather,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  const logout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userData");
          router.replace("(auth)/LoginScreen");
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData !== null) {
          const parsedData = JSON.parse(userData);
          // console.log(parsedData);
          setUserData(parsedData);
        }
        // else {
        //   router.push("/(auth)/LoginScreen");
        // }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <ScrollView className="bg-gray-100">
      {/* Orders */}
      <View className="bg-white p-4 mt-2">
        <View className="flex-row justify-between">
          <Text className="font-semibold">Orders</Text>
        </View>
        <View className="flex-row justify-around mt-3">
          <TouchableOpacity
            onPress={() => router.push("/order/OrderHome?orderStatus=Pending")}
          >
            <IconLabel icon="timer" label="Pending" library="MaterialIcons" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push("/order/OrderHome?orderStatus=Pending%20Payment")
            }
          >
            <IconLabel
              icon="credit-card"
              label="Pending Payment"
              library="Feather"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push("/order/OrderHome?orderStatus=Delivering")
            }
          >
            <IconLabel
              icon="local-shipping"
              label="Delivering"
              library="MaterialIcons"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/order/OrderHome?orderStatus=Finished")}
          >
            <IconLabel icon="check-circle" label="Finished" library="Feather" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Auction & Invoice */}
      <View className="bg-white p-4 mt-2">
        <TouchableOpacity
          className="flex-row justify-between py-2"
          onPress={() => router.push(`/(components)/AuctionHistoryScreen`)}
        >
          <Text>Auction History</Text>
          <MaterialIcons name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row justify-between py-2"
          onPress={() => router.push(`/(components)/InvoiceList`)}
        >
          <Text>My Invoice</Text>
          <MaterialIcons name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row justify-between py-2"
          onPress={() => router.push(`/(components)/profile/AboutMe`)}
        >
          <Text>About Me</Text>
          <MaterialIcons name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Auction Invoice */}
      <View className="bg-white p-4 mt-2">
        <View className="flex-row justify-between">
          <Text className="font-semibold"> Auction Invoice</Text>
        </View>
        <View className="flex-row justify-around mt-3">
          <TouchableOpacity
            onPress={() => router.push("/invoice/InvoiceHome?orderStatus=Paid")}
          >
            <IconLabel icon="credit-card" label="Paid" library="Feather" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push("/invoice/InvoiceHome?orderStatus=Delivering")
            }
          >
            <IconLabel
              icon="local-shipping"
              label="Delivering"
              library="MaterialIcons"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push("/invoice/InvoiceHome?orderStatus=Finished")
            }
          >
            <IconLabel icon="check-circle" label="Finished" library="Feather" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push("/invoice/InvoiceHome?orderStatus=Cancelled")
            }
          >
            <IconLabel
              icon="cancel"
              label="Cancelled"
              library="MaterialIcons"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-white p-4 mt-2">
        <Text className="font-semibold">My Utilities</Text>
        <View className="flex-row justify-around mt-3">
          <TouchableOpacity onPress={() => router.push(`(components)/Wallet`)}>
            <IconLabel icon="wallet" label="My Wallet" library="Entypo" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`(components)/WalletTransaction`)}
          >
            <IconLabel
              icon="calendar"
              label="Wallet Transaction History"
              library="Feather"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-white p-4 mt-2">
        {!userData && (
          <TouchableOpacity
            className="flex-row py-2"
            onPress={() => router.push("(auth)/LoginScreen")}
          >
            <AntDesign
              name="login"
              size={24}
              color="blue"
              className="ml-3 mr-3"
            />
            <Text className="text-blue-600 font-bold ml-3">Log in</Text>
          </TouchableOpacity>
        )}
        {userData && (
          <TouchableOpacity className="flex-row py-2" onPress={logout}>
            <AntDesign
              name="poweroff"
              size={24}
              color="red"
              className="ml-3 mr-3"
            />
            <Text className="text-red-600 font-bold ml-3">Log out</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const IconLabel = ({ icon, label, library = "FontAwesome" }: any) => {
  const IconComponent =
    library === "MaterialIcons"
      ? MaterialIcons
      : library === "Entypo"
      ? Entypo
      : library === "Feather"
      ? Feather
      : FontAwesome;

  return (
    <View className="items-center">
      <IconComponent name={icon} size={24} color="black" />
      <Text className="text-xs mt-1 text-center">{label}</Text>
    </View>
  );
};
