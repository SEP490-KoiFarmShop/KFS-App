import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { RadioButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from "@expo/vector-icons/Entypo";

const paymentMethods = [
  { id: 1, name: "Banking" },
  { id: 3, name: "Wallet" },
];

export default function OTPSuccess() {
  const { id } = useLocalSearchParams();
  const consignmentId = Array.isArray(id) ? id[0] : id;

  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(1);
  const [balance, setBalance] = useState<any>(null);
  const [consignment, setConsignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/Wallet/GetWalletForCustomer`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setBalance(response.data);
        } else {
          console.warn("Balance data is null.");
          setBalance(null);
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };

    fetchBalance();
  }, []);

  useEffect(() => {
    const fetchConsignmentDetails = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      try {
        setLoading(true);
        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/Consignment/Detail?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setConsignment(response.data);
        } else {
          console.warn("Consignment data is null.");
          Alert.alert("Error", "Could not fetch consignment details.");
        }
      } catch (err) {
        console.error("Failed to fetch consignment:", err);
        Alert.alert("Error", "Failed to fetch consignment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchConsignmentDetails();
  }, [id]);

  const handleBankingPayment = async () => {
    try {
      const response = await axios.post(
        `https://kfsapis.azurewebsites.net/api/Consignment/DepositPaymentForConsignment?consignmentId=${id}`
      );
      if (response.status === 201) {
        const paymentData = response.data;
        console.log(paymentData);
        if (paymentData && paymentData.order_url) {
          Linking.openURL(paymentData.order_url)
            .then(() => {
              router.push("/(tabs)/home");
            })
            .catch((err) => {
              console.error("Linking error:", err);
              Alert.alert(
                "Error",
                "Cannot open ZaloPay. Please make sure the app is installed."
              );
            });
        } else {
          Alert.alert(
            "Error",
            "Payment information is missing. Please try again."
          );
        }
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert(
        "Error",
        "Failed to process payment. Please check your connection."
      );
    }
  };

  const handleWalletPayment = async () => {
    try {
      // Get JWT token
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const formData = new FormData();
      formData.append("KoiConsignmentId", consignmentId);

      const response = await axios.post(
        `https://kfsapis.azurewebsites.net/api/Wallet/PaymentWithWallet`,
        // {
        //   KoiConsignmentId: consignmentId,
        // },
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 201) {
        Alert.alert("Success", "Payment completed successfully!", [
          {
            text: "OK",
            onPress: () => router.push("/consignment/ConsignmentList"),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          "Something went wrong with wallet payment. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Wallet Payment Error:", error);
      const errorMessage =
        error.response.data.Message ||
        "Failed to process wallet payment. Please check your balance.";
      Alert.alert("Payment Failed", errorMessage);
    }
  };

  const handleContinue = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Error", "Please select a payment method.");
      return;
    }

    if (selectedPaymentMethod === 1) {
      await handleBankingPayment();
    } else if (selectedPaymentMethod === 3) {
      await handleWalletPayment();
    }
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-2 rounded-full bg-gray-100"
      >
        <Entypo name="chevron-thin-left" size={24} color="black" />
      </TouchableOpacity>
      {/* <Text className="ml-4 text-2xl font-bold">Your Cart</Text> */}

      <View className="w-24 h-24 border-2 border-orange-500 rounded-full flex items-center justify-center mb-6">
        <AntDesign name="check" size={48} color="#FB923C" />
      </View>

      <Text className="text-xl font-bold text-gray-800 mb-2">Success!</Text>
      <Text className="text-gray-500 text-center mb-6">
        Congratulations! You have been successfully authenticated. Click
        continue to proceed with payment.
      </Text>

      <Text className="text-gray-500 text-center mb-6 text-xl font-bold">
        Deposit amount: {consignment?.depositAmount.toLocaleString()} VNĐ
      </Text>

      <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-1 mt-6 w-full">
        <Text className="text-lg font-semibold text-gray-800">
          Select Payment Method
        </Text>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          className="mt-2"
        >
          <View className="flex-row gap-4">
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                className={`flex-row items-center px-4 py-2 rounded-lg border ${
                  selectedPaymentMethod === method.id
                    ? "border-orange-500 bg-orange-100"
                    : "border-gray-300"
                }`}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <RadioButton
                  value={method.id.toString()}
                  status={
                    selectedPaymentMethod === method.id
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={() => setSelectedPaymentMethod(method.id)}
                  color="#FF6B00"
                />
                <Text className="ml-2 text-gray-700 text-lg">
                  {method.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="border-2 border-purple-600 rounded-xl p-4 mt-4 flex-row justify-between items-center bg-white shadow-sm w-full">
        <View className="flex-row items-center">
          <FontAwesome name="credit-card" size={24} color="#673ab7" />
          <View className="ml-3">
            <Text className="text-xs text-gray-500">Balance</Text>
            <Text className="text-xl font-semibold text-black">
              {balance?.availableBalance.toLocaleString()} VNĐ
            </Text>
          </View>
        </View>
        <FontAwesome name="eye" size={20} color="#673ab7" />
      </View>

      <TouchableOpacity
        className={`
    bg-orange-400 py-4 px-6 rounded-full w-full shadow-md mt-6 
    ${
      loading ||
      selectedPaymentMethod === null ||
      balance?.availableBalance < consignment?.depositAmount
        ? "opacity-50"
        : ""
    }
  `}
        onPress={handleContinue}
        disabled={
          loading ||
          selectedPaymentMethod === null ||
          balance?.availableBalance < consignment?.depositAmount
        }
      >
        <Text className="text-white text-center font-semibold text-lg">
          {loading ? "Loading..." : "Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
