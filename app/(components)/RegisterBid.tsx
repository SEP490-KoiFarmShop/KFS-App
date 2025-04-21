import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import GlobalApi from "@/utils/GlobalApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  type: string;
  status: string;
  exchangeMethod: string;
  imageUrl: string[];
  certificateImageUrl: string[];
  breeders: string;
  varieties: string;
  bornDate: string;
  size: number;
  gender: string;
  origin: string;
  weight: number;
  personality: string;
  feedingAmountPerDay: number;
  healthStatus: string;
  screeningRate: number;
  fromSize: number | null;
  toSize: number | null;
}

interface Bid {
  id: number;
  amount: number;
  createdAt: string;
  customerId: number;
  customerName: string;
  isYourBid: boolean;
}

interface Auction {
  id: number;
  name: string;
  imageUrl: string;
  ordinalNumber: number;
  totalBidders: number;
  startTime: string;
  expectedEndTime: string;
  actualEndTime: string | null;
  remainingTime: string | null;
  depositRate: number;
  depositAmount: number;
  startingPrice: number;
  buyNowPrice: number;
  priceStep: number;
  currentHighestBid: number | null;
  currentHighestBidderId: number | null;
  winnerId: number | null;
  status: string;
  isExtend: boolean;
  extendRoundNum: number;
  productId: number;
  product: Product;
  bids: Bid[];
  isRegistered: boolean;
}

export default function RegisterBid() {
  const router = useRouter();
  const { lotId } = useLocalSearchParams();
  const [isChecked, setIsChecked] = useState(false);
  const [lotData, setLotData] = useState<Auction | null>(null);
  const [koisById, setKoisById] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

  const handleRegisterBid = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;
      console.log(lotId);
      const response = await axios.post(
        `https://kfsapis.azurewebsites.net/api/v1/auctions/lot/register`,
        {
          lotId: lotId,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Registration successful!");
      router.push(`/(components)/BidScreen?lotId=${lotId}`);
    } catch (error) {
      console.error("Error registering bid:", error);
      alert("Registration failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        const response = await fetch(
          "https://kfsapis.azurewebsites.net/api/Wallet/GetWalletForCustomer",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch wallet data");
        }

        const walletData = await response.json();
        setBalance(walletData.balance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchWalletBalance();
  }, []);

  useEffect(() => {
    const fetchLotDetails = async () => {
      try {
        const response = await GlobalApi.getLotById(lotId);
        setLotData(response.data);
        if (response.data.product) {
          const product = response.data.product;
          setKoisById(product);
        }
      } catch (error) {
        console.error("Error fetching lot details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (lotId) {
      fetchLotDetails();
    }
  }, [lotId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  const formatVNTime = (dateString?: string | null) => {
    if (!dateString) return "N/A";

    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount == null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <View className="flex-1 bg-white p-5">
      <TouchableOpacity
        onPress={() =>
          router.push(`/(components)/LotDetailScreen?lotId=${lotId}`)
        }
      >
        <View className="flex-row items-center">
          <Feather name="arrow-left" size={24} color="black" />
          <Text className="text-lg font-bold ml-3">Register Auction</Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="ml-5"
        >
          {Array.isArray(koisById?.imageUrl)
            ? koisById.imageUrl.map((url: string, index: number) => (
                <Image
                  key={index}
                  className="w-[250px] h-[300px] mt-5 mr-5"
                  source={{ uri: url }}
                  resizeMode="contain"
                />
              ))
            : lotData?.imageUrl
            ? [lotData.imageUrl].map((url: string, index: number) => (
                <Image
                  key={index}
                  className="w-[250px] h-[300px] mt-5 mr-5"
                  source={{ uri: url }}
                  resizeMode="contain"
                />
              ))
            : [require("../../assets/icon/defaultimage.jpg")].map(
                (img, index: number) => (
                  <Image
                    key={index}
                    className="w-[250px] h-[300px] mt-5 mr-5"
                    source={img}
                    resizeMode="contain"
                  />
                )
              )}
        </ScrollView>
      </View>

      <Text className="text-gray-500 mt-3 text-center">
        {formatVNTime(lotData?.startTime)} -{" "}
        {formatVNTime(lotData?.expectedEndTime)}
      </Text>

      <Text className="text-xl font-bold text-center mt-5">
        {koisById?.name}
      </Text>

      <View className="mt-10">
        <Text className="text-gray-600">
          Deposit Amount: {formatCurrency(lotData?.depositAmount)}
        </Text>
        <Text className="text-gray-600">
          Bid increment: {formatCurrency(lotData?.priceStep)}
        </Text>
        <Text className="text-gray-600">
          Start bid: {formatCurrency(lotData?.startingPrice)}
        </Text>
        <Text className="text-gray-600">
          Price buy now: {formatCurrency(lotData?.buyNowPrice)}
        </Text>
      </View>

      <View className="mt-8">
        <Text className="text-orange-500 text-2xl font-semibold mb-5">
          Balance of wallet: {formatCurrency(balance)}
        </Text>
      </View>

      <View className="flex-1 justify-end pb-5">
        <TouchableOpacity
          className="flex-row items-center mb-5"
          onPress={() => setIsChecked(!isChecked)}
        >
          <View
            className={`w-5 h-5 rounded-md border ${
              isChecked ? "bg-orange-500 border-orange-500" : "border-gray-400"
            } flex items-center justify-center`}
          >
            {isChecked && <Feather name="check" size={14} color="white" />}
          </View>
          <Text className="text-gray-600 ml-3">
            I confirm that I have read and accept the{" "}
            <Text className="text-black font-semibold">
              terms and conditions
            </Text>{" "}
            and <Text className="text-black font-semibold">privacy policy</Text>
            .
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`p-2 rounded-lg ${
            isChecked ? "bg-orange-500" : "bg-gray-300"
          }`}
          disabled={!isChecked}
          onPress={handleRegisterBid}
        >
          <Text className="text-white text-center font-semibold">
            Register to bid
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
