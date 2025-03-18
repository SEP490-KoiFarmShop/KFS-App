import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import Entypo from '@expo/vector-icons/Entypo';
import CustomButton from "@/components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddOrderInfor() {
    const { orderId } = useLocalSearchParams();
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [contactPhoneNumber, setContactPhoneNumber] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem("userData");
                if (userData !== null) {
                    const parsedData = JSON.parse(userData);
                    setFullName(parsedData.fullName);
                } else {
                    router.push("/(auth)/LoginScreen")
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <View className="flex-1 bg-gray-100">
            {/* Header */}
            <View className='flex-row items-center p-5 bg-white shadow-md mb-5'>
                <TouchableOpacity onPress={() => router.back()} className='p-2 rounded-full bg-gray-100'>
                    <Entypo name="chevron-thin-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className='ml-4 text-2xl font-bold'>Add Information Order</Text>
            </View>

            {/* Form nhập địa chỉ */}
            <View className="bg-white p-5 rounded-lg mx-3 mt-5">
                <Text className="text-gray-500 text-4xl mb-10 font-bold">Add Information</Text>

                <TextInput
                    className="border-b border-gray-300 py-4 text-xl text-gray-700 mb-10 bg-gray-100"
                    placeholder="Fullname"
                    value={fullName}
                    editable={false}
                />

                <TextInput
                    className="border-b border-gray-300 py-4 text-xl text-gray-700 mb-10"
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    value={contactPhoneNumber}
                    onChangeText={setContactPhoneNumber}
                />

                <TextInput
                    className="border-b border-gray-300 py-4 text-xl text-gray-700 mb-10"
                    placeholder="Address"
                    value={address}
                    onChangeText={setAddress}
                />
            </View>

            {/* Checkout Section */}
            <View className='absolute bottom-0 left-0 right-0 bg-white p-5 shadow-lg'>
                <CustomButton
                    title="Confirm"
                    handlePress={() => {
                        if (!fullName || !contactPhoneNumber || !address) {
                            Alert.alert("Error", "Please fill in all fields!");
                            return;
                        }

                        router.push({
                            pathname: "/OrderDetail",
                            params: { orderId, fullName, contactPhoneNumber, address }
                        });
                    }}
                    containerStyles="bg-orange-500 h-14 rounded-lg shadow-md mt-5"
                />
            </View>
        </View>
    );
}
