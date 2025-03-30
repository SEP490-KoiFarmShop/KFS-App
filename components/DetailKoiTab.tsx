import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image } from "react-native";
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
}

export default function DetailKoiTab({ lotId }: { lotId: string }) {
    const [koiDetail, setKoiDetail] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchKoiDetail = async () => {
            try {
                const response = await axios.get(`https://kfsapis.azurewebsites.net/api/v1/auctions/lot/${lotId}`);
                console.log("response.data:", response.data);
                console.log("response.data.data:", response.data.data);
                console.log("response.data.data.product:", response.data.data.product);

                if (response.data && response.data.data && response.data.data.product) {
                    console.log("Setting koiDetail to:", response.data.data.product);
                    setKoiDetail(response.data.data.product);
                } else {
                    console.log("No product data found in response");
                    setKoiDetail(null);
                }
            } catch (error) {
                console.error("Error fetching koi details:", error);
                setKoiDetail(null);
            }
        };

        fetchKoiDetail();
    }, [lotId]);

    useEffect(() => {
        console.log("koiDetail updated:", koiDetail);
    }, [koiDetail]);

    if (isLoading) {
        return (
            <View className="justify-center items-center flex-1">
                <ActivityIndicator size="large" color="red" />
            </View>
        );
    }

    if (!koiDetail) {
        return (
            <View className="justify-center items-center flex-1">
                <Text className="text-gray-500">No data available</Text>
            </View>
        );
    }

    return (
        // <ScrollView className="m-5">
        //     <Text className="font-bold text-2xl text-black ml-2">123</Text>
        //     <Text className="font-bold text-2xl text-black ml-2">{koiDetail.name}</Text>
        //     <Text className="font-semibold text-orange-600 mt-3 text-xl ml-5">
        //         {koiDetail.price.toLocaleString("vi-VN")} VNĐ
        //     </Text>

        //     <Text className="font-semibold text-xl mt-5">Detail Information:</Text>
        //     <View className="mt-3 mb-3">
        //         <Text className="text-gray-700 text-lg">♂️ Gender: {koiDetail.gender}</Text>
        //         <Text className="text-gray-700 text-lg">📏 Size: {koiDetail.size} cm</Text>
        //         <Text className="text-gray-700 text-lg">⚖️ Weight: {koiDetail.weight} kg</Text>
        //         <Text className="text-gray-700 text-lg">📅 Born Date: {new Date(koiDetail.bornDate).toLocaleDateString("vi-VN")}</Text>
        //         <Text className="text-gray-700 text-lg">
        //             ✅ Status: <Text className="text-green-500 text-lg font-bold">{koiDetail.status}</Text>
        //         </Text>
        //         <Text className="text-gray-700 text-lg">🎨 Varieties: {koiDetail.varieties}</Text>
        //         <Text className="text-gray-700 text-lg">🌍 Origin: {koiDetail.origin}</Text>
        //         <Text className="text-gray-700 text-lg">🍽️ Feeding Amount: {koiDetail.feedingAmountPerDay} g/day</Text>
        //         <Text className="text-gray-700 text-lg">🔍 Screening Rate: {koiDetail.screeningRate}%</Text>
        //     </View>

        //     {koiDetail.personality && (
        //         <View className="mt-3 mb-3">
        //             <Text className="font-semibold text-lg">Personality:</Text>
        //             <Text className="text-gray-700 text-base mt-1">{koiDetail.personality}</Text>
        //         </View>
        //     )}

        //     {koiDetail.healthStatus && (
        //         <View className="mt-3 mb-3">
        //             <Text className="font-semibold text-lg">Health Status:</Text>
        //             <Text className="text-gray-700 text-base mt-1">{koiDetail.healthStatus}</Text>
        //         </View>
        //     )}

        //     {koiDetail.certificateImageUrl.length > 0 && (
        //         <View className="m-5">
        //             <Text className="font-bold text-2xl text-black mb-3">Certificates</Text>
        //             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        //                 {koiDetail.certificateImageUrl.map((url: string, index: number) => (
        //                     <Image key={index} className="w-[250px] h-[300px] mr-5" source={{ uri: url }} resizeMode="contain" />
        //                 ))}
        //             </ScrollView>
        //         </View>
        //     )}
        // </ScrollView>
        <ScrollView className="m-5">
            <Text>Test: This should appear</Text>
        </ScrollView>
    );
}
