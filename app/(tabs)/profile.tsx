import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


export default function Profile() {
  const router = useRouter();
  return (
    <ScrollView className="bg-gray-100">
      <View className="bg-white p-4 mt-2">
        <View className="flex-row justify-between">
          <Text className="font-semibold">Orders</Text>
          <Text className="text-blue-500">Purchase History</Text>
        </View>
        <View className="flex-row justify-around mt-3">
          <TouchableOpacity onPress={() => router.push("/order/OrderHome?orderStatus=Pending%20Payment")}>
            <IconLabel icon="check-circle" label="Pending Payment" />
          </TouchableOpacity>
          <IconLabel icon="local-shipping" label="Chờ lấy hàng" library="MaterialIcons" />
          <IconLabel icon="directions-car" label="Chờ giao hàng" library="MaterialIcons" />
          <IconLabel icon="star" label="Đánh giá" />
        </View>
      </View>

      <View className="bg-white p-4 mt-2">
        <TouchableOpacity className="flex-row justify-between py-2" onPress={() => router.push(`/(components)/AuctionHistoryScreen`)}>
          <Text>Auction History</Text>
          <MaterialIcons name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row justify-between py-2">
          <Text>My Consignment</Text>
          <MaterialIcons name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <View className="bg-white p-4 mt-2">
        <Text className="font-semibold">Ngày 15 Sale Giữa Tháng</Text>
        <View className="flex-row justify-around mt-3">
          <IconLabel icon="bolt" label="Khung Giờ Săn Sale" />
          <IconLabel icon="play-circle" label="Shopee Live" />
        </View>
      </View>

      <View className="bg-white p-4 mt-2">
        <Text className="font-semibold">Tiện ích của tôi</Text>
        <View className="flex-row justify-around mt-3">
          <TouchableOpacity onPress={() => router.push(`/(components)/Wallet`)}>
            <IconLabel icon="credit-card" label="Ví ShopeePay" />
          </TouchableOpacity>
          <IconLabel icon="money" label="SPayLater" />
          <IconLabel icon="gift" label="Shopee Xu" />
          <IconLabel icon="local-offer" label="Kho Voucher" library="MaterialIcons" />
        </View>
      </View>
    </ScrollView>
  );
}

const IconLabel = ({ icon, label, library = "FontAwesome" }: any) => {
  const IconComponent = library === "MaterialIcons" ? MaterialIcons : FontAwesome;

  return (
    <View className="items-center">
      <IconComponent name={icon} size={24} color="black" />
      <Text className="text-xs mt-1">{label}</Text>
    </View>
  );
};
