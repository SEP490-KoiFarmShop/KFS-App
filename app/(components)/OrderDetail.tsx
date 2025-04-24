import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { RadioButton } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";

const paymentMethods = [
  { id: 1, name: "Banking" },
  { id: 2, name: "COD" },
  { id: 3, name: "Wallet" },
];

export default function OrderDetail() {
  const { orderId, fullName, contactPhoneNumber, address } =
    useLocalSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);
  const [balance, setBalance] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("userData");

        if (!token) {
          Alert.alert("Error", "You need to login first!");
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(token);
        const jwtToken = parsedToken?.accessToken;

        setIsLoading(true);

        const formattedOrderId = Array.isArray(orderId)
          ? orderId.join("").replace(/x/g, "&koi-fish-ids=")
          : orderId.replace(/x/g, "&koi-fish-ids=");

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/orders/check-out?koi-fish-ids=${formattedOrderId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        setOrderData(response.data);
      } catch (error: any) {
        console.error(
          "Lỗi khi lấy chi tiết đơn hàng:",
          error.response.data.Message
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

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
    const fetchUserDetail = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);
        if (response.data) {
          setCustomer(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch user information:", err);
      }
    };

    fetchUserDetail();
  }, []);

  const handleConfirmOrder = async () => {
    if (isProcessing) {
      return;
    }

    if (selectedPaymentMethod === null) {
      Alert.alert("Error", "Please select a payment method!");
      return;
    }

    try {
      setIsProcessing(true);

      const token = await AsyncStorage.getItem("userData");
      if (!token) {
        Alert.alert("Error", "You need to login first!");
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(token);
      const jwtToken = parsedToken?.accessToken;

      const orderPayload = {
        fullName: fullName || "N/A",
        contactPhoneNumber: contactPhoneNumber || "N/A",
        address: address || "N/A",
        koiFishIds: orderData.items.map((item: any) => item.id),
        paymentMethodId: selectedPaymentMethod,
        totalAmount: orderData.paymentDetails["Total Amount"],
        shippingCost: orderData.paymentDetails["Shipping Cost"],
        membershipDiscount: orderData.paymentDetails["Membership Discount"],
        finalAmount: orderData.paymentDetails["Final Amount"],
      };

      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/orders/",
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        if (response.data?.order_url) {
          Linking.openURL(response.data.order_url)
            .then(() => {
              router.push("OrderSuccess");
            })
            .catch(() => {
              Alert.alert("Lỗi", "Không thể mở liên kết thanh toán.");
            });
        } else {
          Alert.alert("Success", "Your order has been placed successfully!", [
            { text: "OK", onPress: () => router.push("OrderSuccess") },
          ]);
        }
      } else if (response.status === 201) {
        router.push("OrderSuccess");
      } else if (response.status === 204) {
        router.push("OrderSuccess");
      } else {
        Alert.alert("Error", "Failed to place the order. Please try again.");
      }
    } catch (error: any) {
      console.error("Order error:", error.response?.data.Message || error);
      Alert.alert(error.response?.data.Message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#FF6B00" />;
  }

  if (!orderData) {
    return (
      <Text className="text-center text-gray-500 mt-10">
        Không tìm thấy đơn hàng
      </Text>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <SafeAreaView className="flex-1">
        {/* Go Back */}
        <View className="flex-row items-center p-5 bg-white shadow-md">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-100"
          >
            <Entypo name="chevron-thin-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-2xl font-bold">Order Details</Text>
        </View>

        {/* Cart Items */}
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-3">
            {customer.fullName && customer.phoneNumber && customer.address ? (
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-800">
                    Recipient Information
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/AddOrderInfor",
                        params: {
                          orderId: orderId,
                          fullName: customer.fullName,
                          phoneNumber: customer.phoneNumber,
                          address: customer.address,
                        },
                      })
                    }
                    className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <AntDesign name="edit" size={16} color="#FF6B00" />
                    <Text className="ml-1 text-orange-500 font-medium">
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-gray-600 mt-1">
                  <Text className="font-bold">Name: </Text>{" "}
                  {fullName || customer.fullName}
                </Text>
                <Text className="text-gray-600 mt-1">
                  <Text className="font-bold">Phone:</Text>{" "}
                  {contactPhoneNumber || customer.phoneNumber}
                </Text>
                <Text className="text-gray-600 mt-1">
                  <Text className="font-bold">Address:</Text>{" "}
                  {address || customer.address}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-row items-center p-4 bg-white shadow-md rounded-lg"
                onPress={() => router.push(`/AddOrderInfor?orderId=${orderId}`)}
              >
                <AntDesign name="pluscircleo" size={24} color="black" />
                <Text className="ml-3">Add Order Information</Text>
              </TouchableOpacity>
            )}
          </View>

          {orderData.items.length > 0 ? (
            orderData.items.map((item: any, index: any) => (
              <View
                key={index}
                className="flex-row items-center p-4 bg-white shadow-md rounded-lg my-2 mx-3"
              >
                <Image
                  source={
                    item.imageUrl
                      ? { uri: item.imageUrl }
                      : require("../../assets/icon/defaultimage.jpg")
                  }
                  className="w-[70px] h-[70px] rounded-lg shadow-md"
                  resizeMode="contain"
                />
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-lg text-gray-800">
                    {item.name}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Số lượng: {item.quantity}
                  </Text>
                </View>
                <Text className="font-semibold text-lg text-orange-500">
                  {item.price.toLocaleString()} VND
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-500 mt-10">Cart empty</Text>
          )}

          <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-3 mt-32">
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

          {/* Summary */}
          <View className="mt-3 p-3 bg-gray-50 rounded-lg shadow-md mx-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-700 text-lg">Subtotal</Text>
              <Text className="text-gray-700 text-lg">
                {Math.floor(
                  orderData.paymentDetails["Total Amount"]
                ).toLocaleString()}{" "}
                VND
              </Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-700 text-lg">Shipping Cost</Text>
              <Text className="text-gray-700 text-lg">
                {Math.floor(
                  orderData.paymentDetails["Shipping Cost"]
                ).toLocaleString()}{" "}
                VND
              </Text>
            </View>
            <View className="flex-row justify-between mt-3 border-t border-gray-300 pt-2">
              <Text className="font-bold text-xl">Total</Text>
              <Text className="font-bold text-xl text-orange-500">
                {Math.floor(
                  orderData.paymentDetails["Final Amount"]
                ).toLocaleString()}{" "}
                VND
              </Text>
            </View>
          </View>

          <View className="border-2 border-[#673ab7] rounded-xl p-4 m-4 flex-row justify-between items-center bg-white shadow-sm ">
            <View className="flex-row items-center">
              <FontAwesome name="credit-card" size={24} color="#673ab7" />
              <View className="ml-3">
                <Text className="text-xs text-gray-500">Balance</Text>
                <Text className="text-xl font-semibold text-black">
                  {balance?.availableBalance?.toLocaleString()} VNĐ
                </Text>
              </View>
            </View>
            <FontAwesome name="eye" size={20} color="#673ab7" />
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-white p-5 shadow-lg">
          <TouchableOpacity
            onPress={handleConfirmOrder}
            disabled={
              isProcessing ||
              (selectedPaymentMethod === 3 &&
                balance?.availableBalance < orderData.totalAmount)
            }
            className={`bg-orange-500 h-14 rounded-lg shadow-md mt-5 flex items-center justify-center ${
              isProcessing ||
              (selectedPaymentMethod === 3 &&
                balance?.availableBalance < orderData.totalAmount)
                ? "opacity-50"
                : ""
            }`}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
