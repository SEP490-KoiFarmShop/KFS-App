import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomButton from '@/components/CustomButton';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Entypo from '@expo/vector-icons/Entypo';

interface Koi {
    id: string;
    name: string;
    sex: string;
    description: string;
    size: string;
    price: number;
    breeder: string;
    bornDate: string;
    image: { url: string }[];
    category: { name: string };
    varieties: string;
    status: string;
}

export default function ConsignmentDetail() {
    const [koisById, setKoisById] = useState<Koi | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useLocalSearchParams();

    useEffect(() => {
        const fetchKoiDetail = async () => {
            try {
                const response = await axios.get(`https://kfsapis.azurewebsites.net/api/Consignment/Detail?id=${id}`);
                const apiData = response.data;

                if (!apiData) {
                    setKoisById(null);
                    return;
                }

                const formattedKoi: Koi = {
                    id: apiData.id?.toString() || "",
                    name: apiData.koiFishConsignment?.name || "Unknown",
                    sex: apiData.gender || "Unknown",
                    description: apiData.notes || "No description available",
                    size: apiData.koiFishConsignment?.size?.toString() || "Unknown",
                    price: apiData.desiredPrice || 0,
                    breeder: apiData.source || "Unknown",
                    image: apiData.imageUrls?.map((url: string) => ({ url })) || [{ url: require('../../assets/icon/defaultimage.jpg') }],
                    category: { name: apiData.koiFishConsignment?.type || "Unknown" },
                    bornDate: apiData.bornDate || "Unknown",
                    varieties: apiData.varieties || "Unknown",
                    status: apiData.status || "Unknown",
                };

                setKoisById(formattedKoi);
            } catch (error) {
                console.error("Error fetching koi details:", error);
                Alert.alert("Error", "Failed to fetch koi details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchKoiDetail();
    }, []);

    const handleReject = async () => {
        try {
            const userData = await AsyncStorage.getItem("userData");
            if (!userData) {
                router.push("/(auth)/LoginScreen");
                return;
            }
            const parsedToken = JSON.parse(userData);
            const jwtToken = parsedToken?.accessToken;

            await axios.put(`https://kfsapis.azurewebsites.net/api/Consignment/ChangeStatusForCustomer`, null, {
                params: {
                    consignmentId: koisById?.id,
                    status: "Rejected",
                },
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
            });

            Alert.alert("Success", "Consignment has been rejected.");
            router.push("/")
        } catch (error) {
            console.error("Error rejecting consignment:", error);
            Alert.alert("Error", "Failed to reject consignment.");
        }
    };
    console.log(koisById?.id)
    const handleAccepted = async () => {
        try {
            const userData = await AsyncStorage.getItem("userData");
            if (!userData) {
                router.push("/(auth)/LoginScreen");
                return;
            }
            const parsedToken = JSON.parse(userData);
            const jwtToken = parsedToken?.accessToken;

            await axios.put(`https://kfsapis.azurewebsites.net/api/Consignment/ChangeStatusForCustomer`, null, {
                params: {
                    consignmentId: koisById?.id,
                    status: "Accepted",
                },
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
            });
            Alert.alert("Success", "Consignment has been rejected.");
            router.push(`/(components)/consignment/ViewContract?id=${id}`)
        } catch (error) {
            console.error("Error rejecting consignment:", error);
            Alert.alert("Error", "Failed to reject consignment.");
        }
    };


    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ff6600" />
            </View>
        );
    }

    if (!koisById) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500 text-lg">No data available</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <View className='flex-row items-center p-5 bg-white shadow-md'>
                <TouchableOpacity onPress={() => router.back()} className='p-2 rounded-full bg-gray-100'>
                    <Entypo name="chevron-thin-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className='ml-4 text-2xl font-bold'>Consignment Detail</Text>
            </View>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row ml-5">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {(koisById.image.length > 0 ? koisById.image : [{ url: require("../../../assets/icon/defaultimage.jpg") }])
                            .map((img, index) => (
                                <Image
                                    key={index}
                                    className="w-[250px] h-[300px] mt-5 mr-5"
                                    source={typeof img.url === "string" ? { uri: img.url } : img.url}
                                    resizeMode="contain"
                                />
                            ))}
                    </ScrollView>
                </View>
                <View className="m-5">
                    <Text className="font-bold text-2xl text-black ml-5">
                        {koisById.name}
                    </Text>
                    <Text className="font-semibold text-orange-600 mt-3 text-xl ml-5">
                        {koisById.price.toLocaleString()} VNĐ
                    </Text>
                    <Text className="text-gray-500 mt-5">- {koisById.description}</Text>
                    <Text className="font-semibold text-xl mt-5">
                        Detail Information of {koisById.name}:
                    </Text>
                    <View className="mt-3 mb-3">
                        <Text className="text-gray-700 text-lg">💰 Type sell: {koisById.category.name}</Text>
                        <Text className="text-gray-700 text-lg">♂️ Gender: {koisById.sex}</Text>
                        <Text className="text-gray-700 text-lg">📏 Size: {koisById.size} cm</Text>
                        <Text className="text-gray-700 text-lg">📅 Born Date: {koisById.bornDate}</Text>
                        <Text className="text-gray-700 text-lg">
                            ✅ Status: <Text className="text-green-500 text-lg font-bold">{koisById.status}</Text>
                        </Text>
                        <Text className="text-gray-700 text-lg">🎨 Varieties: {koisById.varieties}</Text>
                    </View>
                    <View className="m-5">
                        <Text className="font-black text-xl mt-2">Certificates:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                            {koisById.image.length > 0 ? (
                                koisById.image.map((img, index) => (
                                    <Image
                                        key={index}
                                        className="w-[250px] h-[300px] mr-5"
                                        source={{ uri: img.url }}
                                        resizeMode="contain"
                                    />
                                ))
                            ) : (
                                <Text className="text-gray-500">No certificates available</Text>
                            )}
                        </ScrollView>
                    </View>
                    <Text className="font-black text-xl mt-2">Source:</Text>
                    <TouchableOpacity onPress={() => console.log(`Navigate to breeder ${koisById.breeder}`)}>
                        <Text className="text-blue-600 text-xl mt-1 font-medium">
                            {koisById.breeder}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View className="flex-row justify-between px-5">
                <CustomButton
                    title="Rejected"
                    handlePress={handleReject}
                    containerStyles="mt-10 mb-5 bg-red-500 h-14 flex-1 mr-2"
                    textStyles="text-white"
                    isLoading={false}
                />

                <CustomButton
                    title="Accepted"
                    handlePress={handleAccepted}
                    containerStyles="mt-10 mb-5 bg-green-500 h-14 flex-1 ml-2"
                    textStyles="text-white"
                    isLoading={false}
                />
            </View>
        </View>
    );
}
