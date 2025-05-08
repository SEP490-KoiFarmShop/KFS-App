import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  TouchableHighlight,
} from "react-native";
import axios from "axios";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";

interface CustomerDetail {
  id: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  loyaltyPoints: number;
  totalSpending: number;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  membershipRank: string;
  image: string;
  email: string;
  // Add the missing bank information fields
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

export default function CustomerDetailScreen() {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [bankList, setBankList] = useState<Bank[]>([]);
  const [matchedBank, setMatchedBank] = useState<Bank | null>(null);

  useEffect(() => {
    fetchCustomerDetail();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (bankList.length > 0 && customer?.bankName) {
      // Try to match by name or code
      const bank = bankList.find(
        (b) =>
          b.code === customer.bankName ||
          b.name === customer.bankName ||
          b.shortName === customer.bankName
      );
      console.log("bank: ", bank);
      setMatchedBank(bank || null);
    }
  }, [bankList, customer]);

  const fetchBanks = async () => {
    try {
      const response = await axios.get("https://api.vietqr.io/v2/banks");
      if (response.data.data) {
        setBankList(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching banks:", err);
    }
  };

  const handleEditPress = () => {
    router.push("/profile/EditProfile");
  };

  const fetchCustomerDetail = async () => {
    const token = await AsyncStorage.getItem("userData");
    if (!token) {
      Alert.alert("Error", "You need to login first!");
      router.push("/(auth)/LoginScreen");
      return;
    }
    const parsedToken = JSON.parse(token);
    const jwtToken = parsedToken?.accessToken;
    try {
      setLoading(true);
      const response = await axios.get<CustomerDetail>(
        "https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      setCustomer(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setError("Không thể tải thông tin khách hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-600">Đang tải thông tin...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-red-500 text-lg mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-lg"
          onPress={fetchCustomerDetail}
        >
          <Text className="text-white font-medium">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!customer) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">
          Không tìm thấy thông tin khách hàng
        </Text>
      </View>
    );
  }

  // Define rank colors
  const rankColors = {
    Bronze: "bg-amber-700",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
    Platinum: "bg-slate-300",
    Diamond: "bg-cyan-300",
  };

  const rankColor =
    rankColors[customer.membershipRank as keyof typeof rankColors] ||
    "bg-gray-300";

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row items-center mt-8">
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/home`)}
          className="p-2 rounded-full bg-gray-100 ml-3"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-bold">About Me</Text>
      </View>
      <View className="bg-white shadow-sm rounded-lg mx-4 my-4 overflow-hidden">
        <View className="bg-blue-600 p-4 relative">
          <TouchableHighlight
            className="absolute top-2 right-2 z-10"
            onPress={handleEditPress}
            underlayColor="transparent"
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <View className="bg-white px-4 py-2 rounded-lg">
              <Text className="text-black font-medium text-base">
                Chỉnh sửa
              </Text>
            </View>
          </TouchableHighlight>

          <View className="flex-row items-center">
            {/* Profile Image */}
            <Image
              source={
                customer.image
                  ? { uri: customer.image }
                  : require("../../../assets/icon/defaultavatar.png")
              }
              className="w-16 h-16 rounded-full bg-gray-300"
              defaultSource={require("../../../assets/icon/defaultavatar.png")}
            />

            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-bold">
                {customer.fullName}
              </Text>
              <Text className="text-white text-sm mt-1">{customer.email}</Text>
              <View className="flex-row items-center mt-2">
                <View className={`${rankColor} px-3 py-1 rounded-full`}>
                  <Text className="text-white font-medium">
                    {customer.membershipRank}
                  </Text>
                </View>
                <Text className="text-white ml-2">ID: {customer.id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info sections */}
        <View className="p-4">
          <InfoSection
            title="Thông tin liên hệ"
            items={[
              { label: "Email", value: customer.email },
              { label: "Số điện thoại", value: customer.phoneNumber },
              { label: "Địa chỉ", value: customer.address },
            ]}
          />

          {/* Add Bank Information Section */}
          {(customer.bankName ||
            customer.bankAccountNumber ||
            customer.bankAccountName) && (
            <InfoSection
              title="Thông tin ngân hàng"
              items={[
                {
                  label: "Ngân hàng",
                  value: customer.bankName || "Chưa cập nhật",
                },
                {
                  label: "Tên tài khoản",
                  value: customer.bankAccountName || "Chưa cập nhật",
                },
                {
                  label: "Số tài khoản",
                  value: customer.bankAccountNumber || "Chưa cập nhật",
                },
              ]}
              matchedBank={matchedBank}
            />
          )}

          <InfoSection
            title="Thông tin tài khoản"
            items={[
              {
                label: "Điểm tích lũy",
                value: `${customer.loyaltyPoints} điểm`,
              },
              {
                label: "Tổng chi tiêu",
                value: `${formatCurrency(customer.totalSpending)} VND`,
              },
              { label: "Ngày tạo", value: formatDate(customer.createdAt) },
              {
                label: "Cập nhật lần cuối",
                value: formatDate(customer.updatedAt),
              },
            ]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// Helper component for info sections

type InfoItem = {
  label: string;
  value: string;
  customComponent?: React.ReactNode;
};

function InfoSection({
  title,
  items,
  matchedBank,
}: {
  title: string;
  items: InfoItem[];
  matchedBank?: Bank | null;
}) {
  return (
    <View className="mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-2">{title}</Text>
      {items.map((item, index) => (
        <View key={index} className="flex-row py-2 border-b border-gray-100">
          <Text className="text-gray-500 w-1/3">{item.label}</Text>
          {title === "Thông tin ngân hàng" &&
          item.label === "Ngân hàng" &&
          matchedBank ? (
            <View className="flex-row items-center flex-1">
              <Image
                source={{ uri: matchedBank.logo }}
                className="w-6 h-6 mr-2"
              />
              <Text className="text-gray-800 font-medium flex-1">
                {matchedBank.name} ({matchedBank.code})
              </Text>
            </View>
          ) : (
            <Text className="text-gray-800 font-medium flex-1">
              {item.value}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
