import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import GlobalApi from "@/utils/GlobalApi";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
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
  isInConsignment: boolean;
  isConsignedBy: string;
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
  currentHisghestBidderAccountId: string;
  winnerName: string;
  isYourConsignedFish: boolean;
}

export default function LotDetailScreen() {
  const router = useRouter();
  const { lotId } = useLocalSearchParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [koisById, setKoisById] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [connection, setConnection] = useState<SignalR.HubConnection | null>(
    null
  );
  const [userId, setUserId] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [timeCalculated, setTimeCalculated] = useState<boolean>(false);

  // State for image zoom modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  // Check if auction time has ended
  const [isAuctionEnded, setIsAuctionEnded] = useState<boolean>(false);

  // State to track if all data is fully loaded
  const [dataFullyLoaded, setDataFullyLoaded] = useState<boolean>(false);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          setIsLoggedIn(false);
          return;
        }

        const parsedToken = JSON.parse(userData);
        setUserId(parsedToken?.id);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to get user ID:", error);
        setIsLoggedIn(false);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    const connectToSignalR = async () => {
      if (connection?.state === SignalR.HubConnectionState.Connected) {
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

        const newConnection = new SignalR.HubConnectionBuilder()
          .withUrl(`https://kfsapis.azurewebsites.net/lotHub?lotId=${lotId}`, {
            accessTokenFactory: () => jwtToken,
          })
          .withAutomaticReconnect()
          .build();

        newConnection.on("NewBid", (bidData) => {
          console.log("Received NewBid:", bidData);

          setAuction((prevAuction: any) => {
            if (!prevAuction) return null;

            return {
              ...prevAuction,
              currentHighestBid: bidData.amount,
              expectedEndTime: bidData.endTime,
              remainingTime: bidData.timeRemaining,
              bids: [
                {
                  id: bidData.bidId,
                  amount: bidData.amount,
                  createdAt: bidData.createdAt,
                  customerName: bidData.customerName,
                  isYourBid: true,
                },
                ...prevAuction.bids,
              ],
            };
          });
        });

        await newConnection.start();
        console.log("Connected to SignalR");
        setConnection(newConnection);
      } catch (error) {
        console.error("SignalR connection error:", error);
      }
    };
    connectToSignalR();
    return () => {
      if (connection) {
        connection
          .stop()
          .then(() => console.log("SignalR connection stopped."));
        setConnection(null);
      }
    };
  }, []);

  const fetchLotDetail = async () => {
    setIsLoading(true);
    setTimeCalculated(false);
    setDataFullyLoaded(false);
    try {
      const response = await GlobalApi.getLotById(lotId);
      console.log(response.data);
      if (
        !response ||
        !response.data ||
        Object.keys(response.data).length === 0
      ) {
        setAuction(null);
        setKoisById(null);
        return;
      }

      const apiData = response.data;
      setAuction(apiData);
      if (apiData.product) {
        const product = apiData.product;
        setKoisById(product);
      }
    } catch (error) {
      console.error("Error fetching koi details:", error);
      Alert.alert("Error", "Failed to load auction details. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      // Note: dataFullyLoaded will be set to true after time calculation is done
    }
  };

  useEffect(() => {
    fetchLotDetail();
  }, [lotId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLotDetail();
  }, []);

  // Function to handle image press - opens modal with selected image
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  useEffect(() => {
    if (!auction?.expectedEndTime) return;

    const calculateTime = () => {
      const now = new Date();
      const endTime = new Date(auction.expectedEndTime);
      endTime.setHours(endTime.getHours() - 7);
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("End time");
        setIsAuctionEnded(true);
        setTimeCalculated(true);
        setDataFullyLoaded(true);
        return;
      }

      setIsAuctionEnded(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      setTimeCalculated(true);
      setDataFullyLoaded(true);
    };

    // Calculate time immediately
    calculateTime();

    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [auction?.expectedEndTime]);

  // Check if all required data is loaded
  useEffect(() => {
    if (!isLoading && koisById && auction && timeCalculated) {
      setDataFullyLoaded(true);
    }
  }, [isLoading, koisById, auction, timeCalculated]);

  if (!dataFullyLoaded || isLoading) {
    return (
      <View className="justify-center items-center flex-1">
        <ActivityIndicator size="large" color={MD2Colors.red800} />
        <Text className="mt-4 text-gray-600">Loading auction details...</Text>
      </View>
    );
  }

  if (!koisById && !isLoading) {
    return (
      <View className="justify-center items-center flex-1">
        <Text className="text-gray-500">No data available</Text>
        <TouchableOpacity
          onPress={fetchLotDetail}
          className="mt-4 bg-orange-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN");
  };

  const submit = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      if (!auction?.isRegistered) {
        router.push(`/(components)/RegisterBid?lotId=${lotId}`);
      } else {
        router.push(`/(components)/BidScreen?lotId=${lotId}`);
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      Alert.alert("Error", "Failed to process bid. Please try again.");
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine if bid button should be shown
  const shouldShowBidButton = () => {
    return (
      isLoggedIn &&
      !isAuctionEnded &&
      auction?.isYourConsignedFish === false &&
      auction?.status === "Auctioning" &&
      userId !== auction?.currentHisghestBidderAccountId
    );
  };

  return (
    <View className="flex-1">
      {/* Image Zoom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center">
          <TouchableOpacity
            className="absolute top-10 right-5 z-10 p-2 bg-black/50 rounded-full"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-white font-bold text-lg">X</Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: windowWidth * 0.9, height: windowHeight * 0.7 }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <View className="flex-row items-center p-5 bg-white shadow-md">
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/auction`)}
          className="p-2 rounded-full bg-gray-100"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-bold">{koisById?.name}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="ml-5"
          >
            {koisById?.imageUrl && koisById.imageUrl.length > 0
              ? koisById.imageUrl.map((url: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImagePress(url)}
                    activeOpacity={0.8}
                    className="mr-5 mt-5"
                  >
                    <Image
                      className="w-[250px] h-[300px]"
                      source={{ uri: url }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
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

        {auction && (
          <View className="m-5 bg-orange-50 p-4 rounded-lg">
            <View className="flex-row justify-between items-center">
              <Text className="font-bold text-2xl text-black">
                Auction Details
              </Text>
              {refreshing ? (
                <ActivityIndicator size="small" color={MD2Colors.orange800} />
              ) : null}
            </View>

            <View className="mt-3 mb-3">
              <Text className="text-gray-700 text-lg">
                🔢 Lot Number:{" "}
                <Text className="font-semibold">{auction.ordinalNumber}</Text>
              </Text>
              <Text className="text-gray-700 text-lg">
                ⏱️ Start Time:{" "}
                <Text className="font-semibold">
                  {formatDateTime(auction.startTime)}
                </Text>
              </Text>
              <Text className="text-gray-700 text-lg">
                ⌛ End Time:{" "}
                <Text className="font-semibold">
                  {formatDateTime(auction.expectedEndTime)}
                </Text>
              </Text>
              <Text className="text-gray-700 text-lg">
                💰 Starting Price:{" "}
                <Text className="font-semibold text-orange-600">
                  {formatPrice(auction.startingPrice)} VNĐ
                </Text>
              </Text>
              <Text className="text-gray-700 text-lg">
                💸 Buy Now Price:{" "}
                <Text className="font-semibold text-orange-600">
                  {formatPrice(auction.buyNowPrice)} VNĐ
                </Text>
              </Text>
              <Text className="text-gray-700 text-lg">
                🪙 Deposit Amount:{" "}
                <Text className="font-semibold">
                  {formatPrice(auction.depositAmount)} VNĐ (
                  {auction.depositRate * 100}%)
                </Text>
              </Text>
              <Text className="text-gray-700 text-lg">
                📈 Bid Step:{" "}
                <Text className="font-semibold">
                  {formatPrice(auction.priceStep)} VNĐ
                </Text>
              </Text>
              {auction.currentHighestBid && (
                <Text className="text-gray-700 text-lg">
                  🏆 Current Highest Bid:{" "}
                  <Text className="font-semibold text-orange-600">
                    {formatPrice(auction.currentHighestBid)} VNĐ
                  </Text>
                </Text>
              )}
              <Text className="text-gray-700 text-lg">
                👥 Total Bidders:{" "}
                <Text className="font-semibold">{auction.totalBidders}</Text>
              </Text>
              <Text className="text-gray-700 text-lg">
                🚦 Status:{" "}
                <Text className="text-green-500 text-lg font-bold">
                  {auction.status}
                </Text>
              </Text>

              <Text className="text-gray-700 text-lg">
                👨‍💼 Consign by:{" "}
                <Text className="text-orange-500 text-lg font-bold">
                  {auction?.product?.isConsignedBy}
                </Text>
              </Text>

              <Text className="text-gray-700 text-lg">
                🏆 Winner name:{" "}
                <Text className="text-yellow-500 text-lg font-bold">
                  {auction.winnerName}
                </Text>
              </Text>
              <View className="m-5 bg-orange-50 p-4 rounded-lg">
                <Text className="text-gray-700 text-lg">
                  ⌛ Time left:{" "}
                  <Text className="font-semibold text-red-500 text-2xl">
                    {timeLeft}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="m-5 bg-white p-4 rounded-lg shadow-md">
          <Text className="font-bold text-2xl text-black mb-3">
            Bidding History
          </Text>

          {shouldShowBidButton() && (
            <View className="flex-row justify-between items-center space-x-2 mb-5">
              <TouchableOpacity
                onPress={submit}
                className="bg-orange-500 h-14 rounded-lg shadow-md flex-1 ml-2 justify-center items-center"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-lg">Bid</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* {!isLoggedIn && !isAuctionEnded && ( */}
          {!isAuctionEnded && !isLoggedIn && (
            <View className="mb-5 p-3 bg-gray-100 rounded-lg">
              <Text className="text-gray-600 text-center">
                Please login to participate in bidding
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/LoginScreen")}
                className="bg-blue-500 h-10 rounded-lg shadow-md justify-center items-center mt-2"
              >
                <Text className="text-white font-semibold">Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {isAuctionEnded && (
            <View className="mb-5 p-3 bg-yellow-50 rounded-lg">
              <Text className="text-orange-600 text-center font-semibold">
                This auction has ended
              </Text>
            </View>
          )}

          {auction?.bids && auction.bids.length > 0 ? (
            auction.bids.map((bid, index) => (
              <View
                key={index}
                className="flex-row justify-between py-2 border-b border-gray-300"
              >
                <Text className="text-lg font-medium">{bid.customerName}</Text>
                <Text className="text-lg text-orange-600">
                  {formatPrice(bid.amount)}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {formatDateTime(bid.createdAt)}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-center">No bids available</Text>
          )}
        </View>

        <View className="m-5">
          <Text className="font-semibold text-xl mt-5">
            Detail Information of {koisById?.name} :
          </Text>
          <View className="mt-3 mb-3">
            <Text className="text-gray-700 text-lg">
              ♂️ Gender: {koisById?.gender}
            </Text>
            <Text className="text-gray-700 text-lg">
              📏 Size: {koisById?.size} cm
            </Text>
            <Text className="text-gray-700 text-lg">
              ⚖️ Weight: {koisById?.weight} kg
            </Text>
            <Text className="text-gray-700 text-lg">
              📅 Born Date: {formatDate(koisById?.bornDate)}
            </Text>
            <Text className="text-gray-700 text-lg">
              ✅ Status:{" "}
              <Text className="text-green-500 text-lg font-bold">
                {koisById?.status}
              </Text>
            </Text>
            <Text className="text-gray-700 text-lg">
              🎨 Varieties: {koisById?.varieties}
            </Text>
            <Text className="text-gray-700 text-lg">
              🌍 Origin: {koisById?.origin}
            </Text>
            <Text className="text-gray-700 text-lg">
              🍽️ Feeding Amount: {koisById?.feedingAmountPerDay} g/day
            </Text>
            <Text className="text-gray-700 text-lg">
              🔍 Screening Rate: {koisById?.screeningRate}%
            </Text>
          </View>

          {koisById?.personality && (
            <View className="mt-3 mb-3">
              <Text className="font-semibold text-lg">Personality:</Text>
              <Text className="text-gray-700 text-base mt-1">
                {koisById.personality}
              </Text>
            </View>
          )}

          {koisById?.healthStatus && (
            <View className="mt-3 mb-3">
              <Text className="font-semibold text-lg">Health Status:</Text>
              <Text className="text-gray-700 text-base mt-1">
                {koisById.healthStatus}
              </Text>
            </View>
          )}

          <Text className="font-black text-xl mt-2">Source:</Text>
          <TouchableOpacity
            onPress={() =>
              router.push(`/KoiByBreeder?breeder=${koisById?.breeders}`)
            }
          >
            <Text className="text-blue-600 text-xl mt-1 font-medium">
              {koisById?.breeders}
            </Text>
          </TouchableOpacity>
        </View>

        {koisById?.certificateImageUrl &&
          koisById.certificateImageUrl.length > 0 && (
            <View className="m-5">
              <Text className="font-bold text-2xl text-black mb-3">
                Certificates
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {koisById.certificateImageUrl.map(
                  (url: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      className="mr-3"
                      onPress={() => handleImagePress(url)}
                      activeOpacity={0.8}
                    >
                      <Image
                        className="w-[250px] h-[300px] rounded-md"
                        source={{ uri: url }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </View>
          )}
      </ScrollView>
    </View>
  );
}
