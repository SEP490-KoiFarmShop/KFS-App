import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { TextInput } from "react-native-paper";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ViewDetailContract() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;
        const response = await axios.get(
          "https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail",
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        setCustomerData(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
        Alert.alert("Lỗi", "Không thể lấy thông tin khách hàng.");
      }
    };
    fetchCustomerData();
  }, []);

  return (
    <View className="flex-1 bg-white p-4">
      {/* Bọc hợp đồng trong ViewShot */}
      <ScrollView className="flex-1">
        <View className="p-4 bg-white">
          {/* Document title */}
          <View className="items-center mb-4">
            <Text className="text-xl font-bold">
              CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </Text>
            <Text className="text-xl font-bold">
              Độc lập – Tự do – Hạnh phúc
            </Text>
          </View>

          <View className="items-center mb-6">
            <Text className="text-lg font-bold">GIẤY UỶ QUYỀN</Text>
            <Text className="text-sm">(Dành cho cá nhân)</Text>
          </View>

          {/* Document content */}
          <Text className="mb-4">
            - Căn cứ Bộ Luật Dân sự nước Cộng hoà xã hội chủ nghĩa Việt Nam. -
            Căn cứ vào các văn bản hiến pháp hiện hành.
          </Text>
          <Text className="mb-4">
            TP. Hồ Chí Minh, ngày 31 tháng 3 năm 2025; chúng tôi gồm có:
          </Text>

          {/* Section I */}
          <Text className="font-bold mb-2">I. BÊN UỶ QUYỀN</Text>
          <Text className="mb-1">
            Họ tên: {customerData ? customerData.fullName : "Đang tải..."}
          </Text>
          <Text className="mb-1">
            Địa chỉ: {customerData?.address || "Không xác định"}
          </Text>
          <Text className="mb-1">
            Số CCCD: {customerData?.phoneNumber || "Không xác định"}
          </Text>
          <Text className="mb-1">Ngày cấp: Không xác định</Text>
          <Text className="mb-4">Quốc tịch: Việt Nam</Text>

          {/* Section II */}
          <Text className="font-bold mb-2">II. BÊN ĐƯỢC UỶ QUYỀN</Text>
          <Text className="mb-1">Họ tên: Phan Thanh Khải</Text>
          <Text className="mb-1">
            Địa chỉ: S1.01 Vinhomes Grand Park, Tp. Thủ Đức, TP. Hồ Minh
          </Text>
          <Text className="mb-1">Số CMND: 9876545678 cấp ngày: 21/01/2018</Text>
          <Text className="mb-1">
            Nơi cấp: tại Công an tỉnh Tp. Hồ Chí Minh
          </Text>
          <Text className="mb-4">Quốc tịch: Việt Nam</Text>

          {/* Section III */}
          <Text className="font-bold mb-2">III. NỘI DUNG UỶ QUYỀN</Text>
          <Text className="mb-2">
            Bên Uỷ quyền đồng ý ủy quyền cho Bên Nhận Ủy quyền thực hiện các
            hành vi sau đây:
          </Text>
          <Text className="mb-1">
            - Tiếp nhận, định đoạt và định giả tài phẩm từ cá Koi do Bên Uỷ
            quyền gửi.
          </Text>
          <Text className="mb-1">
            - Được phép kiểm tra và nhận vật phẩm nêu trên khi hoàn thành thủ
            tục bán/đấu giá.
          </Text>
          <Text className="mb-1">
            - Nhận tiền hoàn lại từ việc bán/đấu giá.
          </Text>
          <Text className="mb-4">
            - Thay mặt bên uỷ quyền thực hiện, giám sát toàn bộ thủ tục bàn giao
            vật phẩm.
          </Text>

          {/* Section IV */}
          <Text className="font-bold mb-2">IV. CAM KẾT</Text>
          <Text className="mb-2">
            - Hai bên cam kết sẽ hoàn toàn chịu trách nhiệm trước Pháp luật về
            mọi thông tin uỷ quyền ở trên
          </Text>
          <Text className="mb-6">
            - Mọi tranh chấp phát sinh giữa giữa quyền uỷ quyền và bên được uỷ
            quyền sẽ do hai bên tự giải quyết
          </Text>

          {/* Signature sections */}
          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <Text className="mb-8">BÊN UỶ QUYỀN</Text>
              <Text>Ký và ghi rõ họ tên</Text>
            </View>
            <View className="items-center">
              <Text className="mb-8">BÊN ĐƯỢC UỶ QUYỀN</Text>
              <Text>Ký và ghi rõ họ tên</Text>
            </View>
          </View>

          {/* Additional note */}
          <View className="mt-8">
            <Text>
              Tôi đã đọc các điều khoản chính sách của KFS và đồng ý với các
              điều khoản.
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        className="bg-green-500 p-3 rounded-lg mt-4"
        onPress={() => router.back()}
      >
        <Text className="text-center text-white font-bold">Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}
