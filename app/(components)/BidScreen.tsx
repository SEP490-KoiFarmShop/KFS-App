import GlobalApi from "@/utils/GlobalApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
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
import * as SignalR from "@microsoft/signalr";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Added for countdown timer
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isAuctionEnded, setIsAuctionEnded] = useState<boolean>(false);
  // Added for SignalR connection
  const connectionRef = useRef<SignalR.HubConnection | null>(null);
  const [userId, setUserId] = useState<any | null>(null);
  // Track processed bid IDs to prevent duplicates
  const processedBidIdsRef = useRef<Set<number>>(new Set());

  const getInitialBidAmount = () => {
    if (!lotData) return 0;
    return lotData.currentHighestBid !== null
      ? lotData.currentHighestBid
      : lotData.startingPrice;
  };

  const getMinBidAmount = () => {
    if (!lotData) return 0;
    return lotData.currentHighestBid !== null
      ? lotData.currentHighestBid + lotData.priceStep
      : lotData.startingPrice;
  };

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          return;
        }

        const parsedToken = JSON.parse(userData);
        setUserId(parsedToken?.id);
      } catch (error) {
        console.error("Failed to get user ID:", error);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    const connectToSignalR = async () => {
      // Check if we already have a connection
      if (
        connectionRef.current?.state === SignalR.HubConnectionState.Connected
      ) {
        console.log("Already connected to SignalR");
        return;
      }

      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        // Create a new connection
        const newConnection = new SignalR.HubConnectionBuilder()
          .withUrl(`https://kfsapis.azurewebsites.net/lotHub?lotId=${lotId}`, {
            accessTokenFactory: () => jwtToken,
          })
          .withAutomaticReconnect()
          .build();

        // Remove any existing event handlers before adding new ones
        newConnection.off("NewBid");

        // Add event handler for new bids
        newConnection.on("NewBid", (bidData) => {
          console.log("Received NewBid:", bidData);

          // Check if we've already processed this bid
          if (bidData.bidId && processedBidIdsRef.current.has(bidData.bidId)) {
            console.log(`Skipping duplicate bid with ID: ${bidData.bidId}`);
            return;
          }

          // Add this bid ID to our processed set
          if (bidData.bidId) {
            processedBidIdsRef.current.add(bidData.bidId);
          }

          setLotData((prevLotData: any) => {
            if (!prevLotData) return null;

            // Check if this bid is already in the list
            const bidExists = prevLotData.bids.some(
              (bid: any) => bid.id === bidData.bidId
            );
            if (bidExists) {
              console.log(
                `Bid with ID ${bidData.bidId} already exists in state`
              );
              return prevLotData;
            }

            // Create the new bid object
            const newBid = {
              id: bidData.bidId,
              amount: bidData.amount,
              createdAt: bidData.createdAt,
              customerId: bidData.customerId,
              customerName: bidData.customerName,
              isYourBid: bidData.customerId === userId,
            };

            return {
              ...prevLotData,
              currentHighestBid: bidData.amount,
              expectedEndTime: bidData.endTime,
              remainingTime: bidData.timeRemaining,
              bids: [newBid, ...prevLotData.bids],
            };
          });
        });

        await newConnection.start();
        console.log("Connected to SignalR");
        connectionRef.current = newConnection;
      } catch (error) {
        console.error("SignalR connection error:", error);
      }
    };

    connectToSignalR();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("NewBid"); // Remove event handler
        connectionRef.current
          .stop()
          .then(() => console.log("SignalR connection stopped."))
          .catch((err) =>
            console.error("Error stopping SignalR connection:", err)
          );
        connectionRef.current = null;
      }
    };
  }, [lotId, userId]);

  useEffect(() => {
    const fetchLotDetails = async () => {
      try {
        const response = await GlobalApi.getLotById(lotId);
        setLotData(response.data);
        if (response.data.product) {
          const product = response.data.product;
          setKoisById(product);
        }

        // Initialize processed bid IDs with existing bids
        if (response.data.bids && response.data.bids.length > 0) {
          processedBidIdsRef.current = new Set(
            response.data.bids.map((bid: any) => bid.id)
          );
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

  useEffect(() => {
    if (!lotData?.expectedEndTime) return;

    const calculateTime = () => {
      const now = new Date();
      const endTime = new Date(lotData.expectedEndTime);
      endTime.setHours(endTime.getHours() - 7);
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Time out");
        setIsAuctionEnded(true);
        return;
      }

      setIsAuctionEnded(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTime();

    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [lotData?.expectedEndTime]);

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
    if (isSubmitting || isAuctionEnded) {
      return;
    }

    const minBidAmount = getMinBidAmount();

    const numericBidAmount =
      parseInt(bidAmount.replace(/\D/g, ""), 10) || minBidAmount;

    if (numericBidAmount < minBidAmount) {
      Alert.alert(
        "Error",
        `Your bid must be at least ${formatCurrency(minBidAmount)}.`
      );
      return;
    }

    let finalBidAmount = numericBidAmount;
    if (lotData?.buyNowPrice && numericBidAmount > lotData.buyNowPrice) {
      finalBidAmount = lotData.buyNowPrice;
      Alert.alert(
        "Information",
        `Your bid exceeds the Buy Now price. Your bid has been adjusted to the Buy Now price: ${formatCurrency(
          lotData.buyNowPrice
        )}.`
      );
    }

    setIsSubmitting(true);

    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        setIsSubmitting(false);
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      console.log("Sending request with data:", {
        lotId: lotId,
        amount: finalBidAmount,
      });

      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/auctions/lot/bid",
        {
          lotId: lotId,
          amount: finalBidAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const isBuyNow = finalBidAmount === lotData?.buyNowPrice;

      Alert.alert(
        "Success",
        isBuyNow
          ? "Congratulations! You have successfully purchased this item."
          : "Your bid has been placed successfully!"
      );

      // The bid update will come through SignalR instead of updating state directly
      // This ensures all users see the same data

      router.push(`/(components)/LotDetailScreen?lotId=${lotId}`);
    } catch (error: any) {
      console.error(
        "Error placing bid:",
        error.response?.data?.Message || error
      );
      Alert.alert(error.response?.data?.Message || "Error placing bid");
    } finally {
      setIsSubmitting(false);
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

          {/* Countdown Timer Display */}
          {lotData?.status === "Auctioning" && (
            <View className="bg-orange-50 p-4 rounded-lg shadow-sm mb-4">
              <Text className="text-gray-700 text-lg">
                ⌛ Time left:{" "}
                <Text className="font-semibold text-red-500 text-2xl">
                  {timeLeft}
                </Text>
              </Text>
            </View>
          )}

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
              {lotData?.bids.slice(0, 5).map((bid, index) => (
                <View
                  key={bid.id || index}
                  className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center mb-2 bg-white"
                >
                  <Text className="text-sm text-gray-600">
                    {formatVNTime(bid.createdAt)}
                  </Text>
                  <View>
                    <Text className="text-gray-600">{bid.customerName}</Text>
                    <Text
                      className={`text-lg font-semibold ${
                        bid.isYourBid ? "text-green-600" : "text-gray-900"
                      }`}
                    >
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
              disabled={isSubmitting || isAuctionEnded}
            />

            <View className="flex-row space-x-2">
              <TouchableOpacity
                className={`flex-1 p-4 rounded-lg items-center ${
                  isSubmitting || isAuctionEnded
                    ? "bg-gray-400"
                    : "bg-orange-500"
                }`}
                onPress={placeBid}
                disabled={isSubmitting || isAuctionEnded}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Processing...
                    </Text>
                  </View>
                ) : isAuctionEnded ? (
                  <Text className="text-white font-bold text-lg">
                    Auction Ended
                  </Text>
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Place Bid
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
