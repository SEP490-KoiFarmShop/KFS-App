import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadioButton } from "react-native-paper";
import Toast from "react-native-toast-message";

const paymentMethods = [
  { id: 1, name: "Banking" },
  { id: 3, name: "Wallet" },
];

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract all params at once to avoid conditional hook calls
  const invoiceId = params.invoiceId as string;
  const fullName = params.fullName as string;
  const contactPhoneNumber = params.contactPhoneNumber as string;
  const address = params.address as string;

  // State declarations - all hooks must be called in the same order every render
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [customerLotData, setCustomerLotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);
  const [balance, setBalance] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  // Fetch user token - centralized function to avoid duplication
  const getUserToken = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return null;
      }
      const parsedToken = JSON.parse(userData);
      return parsedToken?.accessToken;
    } catch (error) {
      console.error("Error getting user token:", error);
      return null;
    }
  }, [router]);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const jwtToken = await getUserToken();
        console.log(jwtToken);
        if (!jwtToken) return;

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/auction-invoices/${invoiceId}/confirm`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.data) {
          setInvoiceData(response.data.data);
        } else {
          setError("Invalid invoice data received");
        }
      } catch (err) {
        console.error("Failed to fetch invoice details:", err);
        setError("Failed to fetch invoice details.");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoiceDetails();
    } else {
      setLoading(false);
      setError("Invalid invoice ID");
    }
  }, [invoiceId, getUserToken]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const jwtToken = await getUserToken();
        if (!jwtToken) return;

        const response = await axios.get(
          "https://kfsapis.azurewebsites.net/api/Wallet/GetWalletForCustomer",
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
          setBalance({ availableBalance: 0 });
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err);
        setBalance({ availableBalance: 0 });
      }
    };

    fetchBalance();
  }, [getUserToken]);

  useEffect(() => {
    const fetchCustomerLotDetails = async () => {
      if (!invoiceData || !invoiceData.customerLotId) return;

      try {
        const jwtToken = await getUserToken();
        if (!jwtToken) return;

        const customerLotResponse = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/customer-lots/${invoiceData.customerLotId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (customerLotResponse.data?.data) {
          setCustomerLotData(customerLotResponse.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch customer lot details:", err);
        setError("Failed to fetch customer lot details.");
      }
    };

    fetchCustomerLotDetails();
  }, [invoiceData, getUserToken]);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const jwtToken = await getUserToken();
        if (!jwtToken) return;

        const response = await axios.get(
          "https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail",
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);
        if (response.data) {
          setUserData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch user information:", err);
      }
    };

    fetchUserDetail();
  }, [getUserToken]);

  const handleConfirm = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Error", "Please select a payment method.");
      return;
    }

    try {
      const jwtToken = await getUserToken();
      if (!jwtToken) return;

      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/auction-invoices/payment",
        {
          paymentMethodId: selectedPaymentMethod,
          invoiceId: Number(invoiceId),
          name:
            fullName ||
            userData?.customerName ||
            invoiceData?.customerName ||
            "",
          phoneNumber:
            contactPhoneNumber || userData?.phone || invoiceData?.phone || "",
          address: address || userData?.address || invoiceData?.address || "",
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        if (response.data?.data?.order_url) {
          Linking.openURL(response.data.data.order_url)
            .then(() => {
              router.push(`InvoiceSuccess?invoiceId=${invoiceId}`);
            })
            .catch(() => {
              Alert.alert("Error", "Cannot open payment link.");
            });
        } else {
          Alert.alert("Success", "Your order has been placed successfully!", [
            {
              text: "OK",
              onPress: () =>
                router.push(`InvoiceSuccess?invoiceId=${invoiceId}`),
            },
          ]);
        }
      } else if (response.status === 201) {
        router.push(`InvoiceSuccess?invoiceId=${invoiceId}`);
        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Success",
          text2: "Your order has been placed successfully!",
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      console.error("Payment failed:", error?.message || error);
      Alert.alert("Error", "Payment failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!invoiceData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">No invoice data found</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          className="flex-1 bg-gray-100 p-4"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="flex-row items-center py-2">
            <TouchableOpacity
              onPress={() => router.push(`/(components)/InvoiceList`)}
            >
              <MaterialIcons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-lg font-bold ml-2">My Bid Detail</Text>
          </View>

          <View className="bg-white p-4 rounded-lg shadow-md">
            <View className="flex-row justify-between">
              <Text className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                {invoiceData?.status || "N/A"}
              </Text>
              <Text className="text-sm font-semibold">
                INVOICE NUM #{invoiceData.invoiceId || ""}
              </Text>
            </View>

            <View className="flex-row items-center mt-3">
              <Image
                source={{
                  uri:
                    customerLotData?.imageUrl ||
                    "https://via.placeholder.com/150",
                }}
                className="w-20 h-20 rounded-md mr-4"
              />
              <View className="flex-1">
                <Text className="text-base font-bold">
                  {invoiceData.lotName || "Unknown Item"}
                </Text>
                <Text className="text-green-600 text-sm">
                  YOU WIN with{" "}
                  <Text className="font-bold">
                    {(invoiceData.bidPrice || 0).toLocaleString()} đ
                  </Text>
                </Text>
                <Text className="text-gray-500 text-xs">
                  Platform Fee:{" "}
                  {(invoiceData.platformFee || 0).toLocaleString()} đ
                </Text>
                <Text className="text-gray-500 text-xs">
                  Shipping Fee:{" "}
                  {(invoiceData.shippingFee || 0).toLocaleString()} đ
                </Text>
                <Text className="text-gray-500 text-xs">
                  Total: {(invoiceData.totalAmount || 0).toLocaleString()} đ
                </Text>

                <View className="flex-row justify-between items-center mt-2 w-full">
                  <Text className="bg-green-600 text-white px-4 py-1 rounded text-center font-bold">
                    {invoiceData.status === "PendingPayment"
                      ? "PENDING"
                      : "SOLD"}
                  </Text>
                  {customerLotData && (
                    <TouchableOpacity
                      className="bg-blue-500 py-2 px-4 rounded"
                      onPress={() =>
                        router.push(
                          `/(components)/LotDetailScreen?lotId=${customerLotData.lotId}`
                        )
                      }
                    >
                      <Text className="text-white font-semibold">
                        VIEW DETAILS
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View className="bg-white p-4 rounded-lg shadow-md mt-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold">Address Information</Text>

              {invoiceData.status === "PendingPayment" && (
                <TouchableOpacity
                  // onPress={() =>
                  //   router.push(
                  //     `/(components)/AddInvoiceInfor?invoiceId=${invoiceId}`
                  //   )
                  // }
                  onPress={() =>
                    router.push({
                      pathname: "/AddInvoiceInfor",
                      params: {
                        invoiceId: invoiceId,
                        fullName: userData.fullName,
                        phoneNumber: userData.phoneNumber,
                        address: userData.address,
                      },
                    })
                  }
                >
                  <FontAwesome name="edit" size={18} color="gray" />
                </TouchableOpacity>
              )}
            </View>
            <Text className="font-semibold mt-2">
              {fullName || userData?.fullName || "N/A"} |{" "}
              {contactPhoneNumber || userData?.phoneNumber || "N/A"}
            </Text>
            <Text className="text-gray-600 text-sm">
              {address || userData?.address || "No address provided"}
            </Text>
          </View>

          <View className="bg-white p-4 rounded-lg shadow-md mt-6">
            <Text className="text-base font-bold">Timeline</Text>
            <View className="h-[1px] bg-gray-300 my-2" />
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
              <View>
                <Text className="font-semibold">
                  {invoiceData.status || "Processing"}
                </Text>
              </View>
            </View>
          </View>

          {invoiceData.status === "PendingPayment" && (
            <>
              <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-1 mt-6">
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

              <View className="border-2 border-[#673ab7] rounded-xl p-4 mt-4 flex-row justify-between items-center bg-white shadow-sm">
                <View className="flex-row items-center">
                  <FontAwesome name="credit-card" size={24} color="#673ab7" />
                  <View className="ml-3">
                    <Text className="text-xs text-gray-500">Balance</Text>
                    <Text className="text-xl font-semibold text-black">
                      {(balance?.availableBalance || 0).toLocaleString()} VNĐ
                    </Text>
                  </View>
                </View>
                <FontAwesome name="eye" size={20} color="#673ab7" />
              </View>
            </>
          )}
        </ScrollView>

        {invoiceData.status === "PendingPayment" && (
          <View className="bg-white p-5 shadow-lg">
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={
                (!address && !userData?.address) ||
                (selectedPaymentMethod === 3 &&
                  (balance?.availableBalance || 0) <
                    (invoiceData.totalAmount || 0))
              }
              className={`bg-orange-500 h-14 rounded-lg shadow-md justify-center items-center ${
                (!address && !userData?.address) ||
                (selectedPaymentMethod === 3 &&
                  (balance?.availableBalance || 0) <
                    (invoiceData.totalAmount || 0))
                  ? "opacity-50"
                  : ""
              }`}
            >
              <Text className="text-white font-bold text-lg">Confirm</Text>
            </TouchableOpacity>

            {!address && !userData?.address ? (
              <Text className="text-red-500 text-center mt-2">
                Address information is required to proceed.
              </Text>
            ) : selectedPaymentMethod === 3 &&
              (balance?.availableBalance || 0) <
                (invoiceData.totalAmount || 0) ? (
              <Text className="text-red-500 text-center mt-2">
                Insufficient balance. Please add funds or choose another payment
                method.
              </Text>
            ) : null}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
