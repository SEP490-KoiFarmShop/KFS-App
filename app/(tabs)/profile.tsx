import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import {
  FontAwesome,
  MaterialIcons,
  Entypo,
  Feather,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();
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
          {/* <TouchableOpacity
            onPress={() =>
              router.push("/invoice/InvoiceHome?orderStatus=Pending")
            }
          >
            <IconLabel icon="timer" label="Pending" library="MaterialIcons" />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() =>
              router.push("/invoice/InvoiceHome?orderStatus=Pending%20Payment")
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
        </View>
      </View>

      {/* Mid-month Sale */}
      <View className="bg-white p-4 mt-2">
        <Text className="font-semibold">Ngày 15 Sale Giữa Tháng</Text>
        <View className="flex-row justify-around mt-3">
          <IconLabel icon="flash" label="Khung Giờ Săn Sale" library="Entypo" />
          <IconLabel
            icon="live-tv"
            label="Shopee Live"
            library="MaterialIcons"
          />
        </View>
      </View>

      {/* My Utilities */}
      <View className="bg-white p-4 mt-2">
        <Text className="font-semibold">Tiện ích của tôi</Text>
        <View className="flex-row justify-around mt-3">
          <TouchableOpacity onPress={() => router.push(`/(components)/Wallet`)}>
            <IconLabel icon="wallet" label="Ví ShopeePay" library="Entypo" />
          </TouchableOpacity>
          <IconLabel icon="calendar" label="SPayLater" library="Feather" />
          <IconLabel icon="gift" label="Shopee Xu" />
          <IconLabel
            icon="local-offer"
            label="Kho Voucher"
            library="MaterialIcons"
          />
        </View>
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
