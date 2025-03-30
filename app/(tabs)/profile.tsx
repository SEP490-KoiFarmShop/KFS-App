import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import BrandHeader from '../(components)/consignment/BrandHeader';
import { useRouter } from 'expo-router';

/**
 * Component chính: Hồ sơ người dùng
 */
export default function Profile() {
  const router = useRouter();
  return (
    <ScrollView className="bg-gray-100">
      {/* Header thương hiệu */}
      <BrandHeader />
      {/* Đơn mua & Lịch sử mua hàng */}
      <View className="bg-white p-4 mt-2">
        <View className="flex-row justify-between">
          <Text className="font-semibold">Đơn mua</Text>
          <Text className="text-blue-500">Xem lịch sử mua hàng</Text>
        </View>
        <View className="flex-row justify-around mt-3">
          <TouchableOpacity onPress={() => router.push("/order/OrderHome")}>
            <IconLabel icon="check-circle" label="Chờ xác nhận" />
          </TouchableOpacity>
          <IconLabel icon="local-shipping" label="Chờ lấy hàng" library="MaterialIcons" />
          <IconLabel icon="directions-car" label="Chờ giao hàng" library="MaterialIcons" />
          <IconLabel icon="star" label="Đánh giá" />
        </View>
      </View>

      {/* Các dịch vụ */}
      <View className="bg-white p-4 mt-2">
        <TouchableOpacity className="flex-row justify-between py-2">
          <Text>Đơn Nạp thẻ và Dịch vụ</Text>
          <MaterialIcons name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row justify-between py-2">
          <Text>Đơn ShopeeFood</Text>
          <MaterialIcons name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Sale giữa tháng */}
      <View className="bg-white p-4 mt-2">
        <Text className="font-semibold">Ngày 15 Sale Giữa Tháng</Text>
        <View className="flex-row justify-around mt-3">
          <IconLabel icon="bolt" label="Khung Giờ Săn Sale" />
          <IconLabel icon="play-circle" label="Shopee Live" />
        </View>
      </View>

      {/* Tiện ích của tôi */}
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

/**
 * Component IconLabel: Hiển thị biểu tượng và nhãn đi kèm
 * @param {string} icon - Tên biểu tượng
 * @param {string} label - Nhãn hiển thị
 * @param {string} [library="FontAwesome"] - Thư viện biểu tượng (FontAwesome hoặc MaterialIcons)
 */
const IconLabel = ({ icon, label, library = "FontAwesome" }: any) => {
  // Xác định thư viện sử dụng cho biểu tượng
  const IconComponent = library === "MaterialIcons" ? MaterialIcons : FontAwesome;

  return (
    <View className="items-center">
      <IconComponent name={icon} size={24} color="black" />
      <Text className="text-xs mt-1">{label}</Text>
    </View>
  );
};
