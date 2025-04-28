import GlobalApi from "@/utils/GlobalApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, TextInput } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export default function BidScreen() {
  const router = useRouter();
  const { lotId } = useLocalSearchParams();
  const [lotData, setLotData] = useState<Auction | null>(null);
  const [koisById, setKoisById] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");

  // Calculate bid amounts only when lotData is available
  const getInitialBidAmount = () => {
    if (!lotData) return 0;
    return lotData.currentHighestBid !== null
      ? lotData.currentHighestBid
      : lotData.startingPrice;
  };

  const getMinBidAmount = () => {
    if (!lotData) return 0;
    // If there's no current highest bid, the min bid is the starting price
    // Otherwise, it's the highest bid plus the step
    return lotData.currentHighestBid !== null
      ? lotData.currentHighestBid + lotData.priceStep
      : lotData.startingPrice;
  };

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

  const placeBid = async () => {
    // Get the minimum bid amount
    const minBidAmount = getMinBidAmount();

    // Validate the bid amount
    const numericBidAmount =
      parseInt(bidAmount.replace(/\D/g, ""), 10) || minBidAmount;

    if (numericBidAmount < minBidAmount) {
      Alert.alert(
        "Error",
        `Your bid must be at least ${formatCurrency(minBidAmount)}.`
      );
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      console.log("Sending request with data:", {
        lotId: lotId,
        amount: numericBidAmount,
      });

      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/auctions/lot/bid",
        {
          lotId: lotId,
          amount: numericBidAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Success", "Your bid has been placed successfully!");

      // Update the local state with the new bid
      setLotData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          currentHighestBid: numericBidAmount,
          currentHighestBidderId: parsedToken?.id,
          youAreCurrentHisghestBidder: true,
        };
      });

      router.push(`/(components)/LotDetailScreen?lotId=${lotId}`);
    } catch (error) {
      console.error("Error placing bid:", error);
      Alert.alert("Error", "Failed to place bid. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      Alert.alert(
        "Buy Now",
        `Are you sure you want to buy this item now for ${formatCurrency(
          lotData?.buyNowPrice
        )}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Buy Now",
            onPress: async () => {
              try {
                const response = await axios.post(
                  "https://kfsapis.azurewebsites.net/api/v1/auctions/lot/bid",
                  {
                    lotId: lotId,
                    amount: lotData?.buyNowPrice,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${jwtToken}`,
                      "Content-Type": "application/json",
                    },
                  }
                );

                Alert.alert(
                  "Success",
                  "Congratulations! You have successfully purchased this item.",
                  [
                    {
                      text: "OK",
                      onPress: () =>
                        router.push(
                          `/(components)/LotDetailScreen?lotId=${lotId}`
                        ),
                    },
                  ]
                );
              } catch (error) {
                console.error("Error buying now:", error);
                Alert.alert(
                  "Error",
                  "Failed to complete purchase. Please try again."
                );
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error in buy now process:", error.response?.data.Message);
      Alert.alert("Error", "Failed to process your request. Please try again.");
    }
  };

  const handleCustomBid = (text: string) => {
    setBidAmount(text === "" ? "" : text);

    if (text !== "") {
      const numericValue = text.replace(/\D/g, "");

      if (numericValue !== "") {
        const parsedValue = parseInt(numericValue, 10);
        const formattedValue = new Intl.NumberFormat("vi-VN").format(
          parsedValue
        );
        setBidAmount(formattedValue);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4">
        <TouchableOpacity
          onPress={() =>
            router.push(`/(components)/LotDetailScreen?lotId=${lotId}`)
          }
        >
          <View className="flex-row items-center">
            <Feather name="arrow-left" size={24} color="black" />
            <Text className="text-lg font-bold ml-3">Bid Auction</Text>
          </View>
        </TouchableOpacity>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row justify-center">
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

          <Text className="text-lg font-medium mt-2 mb-3">
            Lot ID: #{lotData?.id}
          </Text>
          <Text className="text-xl text-orange-600 font-semibold my-2 mb-5">
            {lotData?.name}
          </Text>
          <Text className="text-sm italic mb-3">
            {formatVNTime(lotData?.startTime)} -{" "}
            {formatVNTime(lotData?.expectedEndTime)}
          </Text>

          <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <Text className="text-sm text-gray-600">
              Estimated value: {formatCurrency(koisById?.price)}
            </Text>
            <Text className="text-sm text-gray-600">
              Bid increment step: {formatCurrency(lotData?.priceStep)}
            </Text>
            <Text className="text-sm text-gray-600">
              Deposit Amount: {formatCurrency(lotData?.depositAmount)}
            </Text>
            <Text className="text-sm text-gray-600">
              Starting bid: {formatCurrency(lotData?.startingPrice)}
            </Text>
            <Text className="text-sm text-gray-600 font-bold">
              Buy now price: {formatCurrency(lotData?.buyNowPrice)}
            </Text>
          </View>

          {lotData?.bids && lotData.bids.length > 0 ? (
            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2">Recent Bids</Text>
              {lotData?.bids.slice(0, 2).map((bid, index) => (
                <View
                  key={index}
                  className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center mb-2 bg-white"
                >
                  <Text className="text-sm text-gray-600">
                    {formatVNTime(bid.createdAt)}
                  </Text>
                  <View>
                    <Text className="text-gray-600">{bid.customerName}</Text>
                    <Text className="text-lg font-semibold text-gray-900">
                      {formatCurrency(bid.amount)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <Text className="text-center text-gray-500">No bids yet</Text>
            </View>
          )}

          <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <Text className="text-lg font-bold mb-2">
              Current price:{" "}
              {lotData?.currentHighestBid
                ? formatCurrency(lotData.currentHighestBid)
                : "No bids yet"}
            </Text>

            <Text className="text-sm text-gray-600 mb-2">
              {lotData?.currentHighestBid
                ? "Minimum next bid:"
                : "Starting bid:"}
            </Text>

            <TextInput
              value={bidAmount}
              onChangeText={handleCustomBid}
              keyboardType="numeric"
              mode="outlined"
              outlineColor="#FF6600"
              activeOutlineColor="#FF6600"
              style={{ backgroundColor: "white", marginBottom: 10 }}
              placeholder={`Min bid : ${formatCurrency(getMinBidAmount())}`}
            />

            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="flex-1 p-4 rounded-lg items-center bg-orange-500"
                onPress={placeBid}
              >
                <Text className="text-white font-bold text-lg">Place Bid</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 p-4 rounded-lg items-center bg-green-600 ml-2"
                onPress={handleBuyNow}
              >
                <Text className="text-white font-bold text-lg">Buy Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
