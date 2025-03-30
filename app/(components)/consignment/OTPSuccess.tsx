import { View, Text, TouchableOpacity, Alert, Linking } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";

export default function OTPSuccess() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const handleContinue = async () => {
        const url = `https://kfsapis.azurewebsites.net/api/Consignment/DepositPaymentForConsignment?consignmentId=${id}`
        console.log(url)
        try {
            const response = await axios.post(
                `https://kfsapis.azurewebsites.net/api/Consignment/DepositPaymentForConsignment?consignmentId=${id}`
            );
            if (response.status === 201) {
                const paymentData = response.data;
                console.log(paymentData)
                if (paymentData && paymentData.order_url) {
                    Linking.openURL(paymentData.order_url)
                        .then(() => {
                            router.push("/(components)/(tabs)/home");
                        })
                        .catch(err => {
                            console.error("Linking error:", err);
                            Alert.alert("Error", "Cannot open ZaloPay. Please make sure the app is installed.");
                        });
                } else {
                    Alert.alert("Error", "Payment information is missing. Please try again.");
                }
            } else {
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("API Error:", error);
            Alert.alert("Error", "Failed to process payment. Please check your connection.");
        }
    };

    return (
        <View className="flex-1 bg-white justify-center items-center px-6">
            <View className="w-24 h-24 border-2 border-orange-500 rounded-full flex items-center justify-center mb-6">
                <AntDesign name="check" size={48} color="#FB923C" />
            </View>

            <Text className="text-xl font-bold text-gray-800 mb-2">Success!</Text>
            <Text className="text-gray-500 text-center mb-6">
                Congratulations! You have been successfully authenticated.
                Click continue to proceed with ZaloPay payment.
            </Text>

            <TouchableOpacity
                className="bg-orange-400 py-4 px-6 rounded-full w-full shadow-md"
                onPress={handleContinue}
            >
                <Text className="text-white text-center font-semibold text-lg">Continue</Text>
            </TouchableOpacity>
        </View>
    );
}
