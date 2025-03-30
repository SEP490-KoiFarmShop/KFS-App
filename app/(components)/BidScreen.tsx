import GlobalApi from '@/utils/GlobalApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, TextInput } from 'react-native-paper';
import * as SignalR from "@microsoft/signalr";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
    id: number
    amount: number
    createdAt: string
    customerId: number
    customerName: string
    isYourBid: boolean
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
    isRegistered: boolean
}


export default function BidScreen() {
    const router = useRouter();
    const { lotId } = useLocalSearchParams();
    const [lotData, setLotData] = useState<Auction | null>(null);
    const [koisById, setKoisById] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState("");
    const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);

    // useEffect(() => {
    //     const connectToSignalR = async () => {
    //         try {
    //             const userData = await AsyncStorage.getItem("userData");
    //             if (!userData) {
    //                 console.error("User data not found. Redirecting to login.");
    //                 router.push("/(auth)/LoginScreen");
    //                 return;
    //             }

    //             const parsedToken = JSON.parse(userData);
    //             const jwtToken = parsedToken?.accessToken;
    //             console.log(`https://kfsapis.azurewebsites.net/lotHub?lotId=${lotId}`)
    //             const newConnection = new SignalR.HubConnectionBuilder()
    //                 .withUrl(`https://kfsapis.azurewebsites.net/lotHub?lotId=${lotId}`, {
    //                     accessTokenFactory: () => jwtToken,
    //                 })
    //                 .withAutomaticReconnect()
    //                 .build();

    //             newConnection.on("NewBid", (bidInfo) => {
    //                 // console.log("New bid received:", bidInfo);
    //                 setLotData((prevData: any) => ({
    //                     ...prevData,
    //                     currentHighestBid: bidInfo.amount
    //                 }));
    //             });



    //             await newConnection.start();
    //             // console.log("Connected to SignalR");
    //             setConnection(newConnection);
    //         } catch (error) {
    //             console.error("SignalR connection error:", error);
    //         }
    //     };

    //     connectToSignalR();

    //     return () => {
    //         if (connection) {
    //             connection.stop().then(() => console.log('Disconnected from SignalR Hub'))
    //                 .catch(err => console.error('Disconnection error:', err));
    //         }
    //     };
    // }, []);

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

    const handleBidInput = (text: string) => {
        const numericValue = text.replace(/\D/g, "");

        if (numericValue === "") {
            setBidAmount("");
            return;
        }

        const parsedValue = parseInt(numericValue, 10);

        const formattedValue = new Intl.NumberFormat("vi-VN").format(parsedValue);

        setBidAmount(formattedValue);
    };

    const placeBid = async () => {
        const bidValue = parseInt(bidAmount.replace(/\D/g, ""), 10);
        const initialBidAmount = lotData?.currentHighestBid ?? lotData?.startingPrice ?? 0;
        const minBidAmount = initialBidAmount + (lotData?.priceStep ?? 0);

        if (bidValue < minBidAmount) {
            Alert.alert("Error", `Your bid must be at least ${formatCurrency(minBidAmount)}.`);
            return;
        }

        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
            router.push("/(auth)/LoginScreen");
            return;
        }

        const parsedToken = JSON.parse(userData);
        const id = parsedToken?.id;
        const jwtToken = parsedToken?.accessToken;
        // console.log("Sending request with data:", {
        //     lotId: lotId,
        //     amount: bidValue
        // });

        try {
            const response = await axios.post("https://kfsapis.azurewebsites.net/api/v1/auctions/lot/bid",
                {
                    lotId: lotId,
                    amount: bidValue,
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        "Content-Type": "application/json",
                    },
                });
            Alert.alert("Success", "Your bid has been placed successfully!");
            setLotData((prevData: any) => ({
                ...prevData,
                currentHighestBid: bidValue
            }));
            router.push(`/(components)/LotDetailScreen?lotId=${lotId}`)
        } catch (error) {
            console.error("Error placing bid:", error);
            Alert.alert("Error", "Failed to place bid. Please try again.");
        }
    };

    return (
        <View className="flex-1 bg-gray-100 p-4">
            <TouchableOpacity onPress={() => router.back()}>
                <View className="flex-row items-center">
                    <Feather name="arrow-left" size={24} color="black" />
                    <Text className="text-lg font-bold ml-3">Bid Auction</Text>
                </View>
            </TouchableOpacity>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-center">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="ml-5">
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
                                : [require("../../assets/icon/defaultimage.jpg")].map((img, index: number) => (
                                    <Image
                                        key={index}
                                        className="w-[250px] h-[300px] mt-5 mr-5"
                                        source={img}
                                        resizeMode="contain"
                                    />
                                ))}
                    </ScrollView>
                </View>

                <Text className="text-lg font-medium mt-2 mb-3">Lot ID: #{lotData?.id}</Text>
                <Text className="text-xl text-orange-600 font-semibold my-2 mb-5">{lotData?.name}</Text>
                <Text className="text-sm italic mb-3">{formatVNTime(lotData?.startTime)} - {formatVNTime(lotData?.expectedEndTime)}</Text>
                <Text className="text-sm italic">Estimated value: {formatCurrency(koisById?.price)}</Text>
                <Text className="text-sm italic">Bid increment step: {formatCurrency(lotData?.priceStep)}</Text>
                <Text className="text-sm italic">Deposit Amount: {formatCurrency(lotData?.depositAmount)}</Text>
                <Text className="text-sm italic">Start bid: {formatCurrency(lotData?.startingPrice)}</Text>
                <Text className="text-sm italic">Price buy now: {formatCurrency(lotData?.buyNowPrice)}</Text>

                <View className="mt-4 mb-2">
                    {lotData?.bids.slice(0, 2).map((bid, index) => (
                        <View key={index} className="border border-gray-400 rounded-lg p-3 flex-row justify-between items-center mb-2">
                            <Text className="text-sm text-gray-600">{formatVNTime(bid.createdAt)}</Text>
                            <Text className="text-lg font-semibold italic text-gray-900">{formatCurrency(bid.amount)}</Text>
                        </View>
                    ))}
                </View>

                <Text className="text-lg font-bold mt-2 mb-2">Highest price: {formatCurrency(lotData?.currentHighestBid)}</Text>

                <TextInput
                    value={bidAmount}
                    onChangeText={handleBidInput}
                    keyboardType="numeric"
                    placeholder="Bid your price"
                    mode="outlined"
                    outlineColor="blue"
                    activeOutlineColor="blue"
                    style={{ backgroundColor: "white" }}
                />

                <TouchableOpacity
                    className={`p-3 rounded-lg mt-2 items-center ${(parseInt(bidAmount.replace(/\D/g, ""), 10) || 0) <
                        (((lotData?.currentHighestBid ?? lotData?.startingPrice ?? 0) + (lotData?.priceStep ?? 0)))
                        ? "bg-gray-400"
                        : "bg-blue-500"
                        }`}
                    disabled={
                        (parseInt(bidAmount.replace(/\D/g, ""), 10) || 0) <
                        (((lotData?.currentHighestBid ?? lotData?.startingPrice ?? 0) + (lotData?.priceStep ?? 0)))
                    }
                    onPress={placeBid}
                >
                    <Text className="text-white font-bold">Bidding</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}
