import React, { useEffect, useState } from "react";
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
import CustomButton from "@/components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadioButton } from "react-native-paper";
import Toast from "react-native-toast-message";

const paymentMethods = [
  { id: 1, name: "Banking" },
  { id: 3, name: "Wallet" },
];

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const { invoiceId, fullName, contactPhoneNumber, address } =
    useLocalSearchParams();
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [customerLotData, setCustomerLotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);
  const [balance, setBalance] = useState<any>(null);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;
        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/auction-invoices/${invoiceId}/confirm`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data.data);
        setInvoiceData(response.data.data);
      } catch (err) {
        setError("Failed to fetch invoice details.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

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
        setError("Failed to fetch wallet balance.");
      }
    };

    fetchBalance();
  }, []);

  const handleConfirm = async () => {
    if (!selectedPaymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/auction-invoices/payment",
        {
          paymentMethodId: selectedPaymentMethod,
          invoiceId: Number(invoiceId),
          name: fullName || invoiceData.customerName,
          phoneNumber: contactPhoneNumber || invoiceData.phone,
          address: address || invoiceData.address,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      if (response.status === 200) {
        if (response.data?.data.order_url) {
          Linking.openURL(response.data.data.order_url)
            .then(() => {
              router.push(`InvoiceSuccess?invoiceId=${invoiceId}`);
            })
            .catch(() => {
              Alert.alert("Lỗi", "Không thể mở liên kết thanh toán.");
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
          text2: "Your order has been placed successfully !",
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      console.error("Payment failed:", error?.message || error);
      alert("Thanh toán thất bại. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (invoiceData && invoiceData.customerLotId) {
      const fetchCustomerLotDetails = async () => {
        try {
          const userData = await AsyncStorage.getItem("userData");
          if (!userData) {
            router.push("/(auth)/LoginScreen");
            return;
          }

          const parsedToken = JSON.parse(userData);
          const jwtToken = parsedToken?.accessToken;
          const customerLotResponse = await axios.get(
            `https://kfsapis.azurewebsites.net/api/v1/customer-lots/${invoiceData.customerLotId}`,
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          setCustomerLotData(customerLotResponse.data.data);
        } catch (err) {
          setError("Failed to fetch customer lot details.");
        }
      };

      fetchCustomerLotDetails();
    }
  }, [invoiceData]);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="blue"
        className="flex-1 justify-center items-center"
      />
    );
  }

  if (error) {
    return <Text className="text-red-500 text-center mt-4">{error}</Text>;
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
                INVOICE NUM #{invoiceData.invoiceId}
              </Text>
            </View>

            <View className="flex-row items-center mt-3">
              <Image
                source={{ uri: customerLotData?.imageUrl }}
                className="w-20 h-20 rounded-md mr-4"
              />
              <View className="flex-1">
                <Text className="text-base font-bold">
                  {invoiceData.lotName}
                </Text>
                <Text className="text-green-600 text-sm">
                  YOU WIN with{" "}
                  <Text className="font-bold">
                    {invoiceData.bidPrice.toLocaleString()} đ
                  </Text>
                </Text>
                <Text className="text-gray-500 text-xs">
                  Platform Fee: {invoiceData.platformFee.toLocaleString()} đ
                </Text>
                <Text className="text-gray-500 text-xs">
                  Shipping Fee: {invoiceData.shippingFee.toLocaleString()} đ
                </Text>
                <Text className="text-gray-500 text-xs">
                  Total: {invoiceData.totalAmount.toLocaleString()} đ
                </Text>

                <View className="flex-row justify-between items-center mt-2 w-full">
                  <Text className="bg-green-600 text-white px-4 py-1 rounded text-center font-bold">
                    {invoiceData.status === "PendingPayment"
                      ? "PENDING"
                      : "SOLD"}
                  </Text>
                  <TouchableOpacity
                    className="bg-blue-500 py-2 px-4 rounded"
                    onPress={() =>
                      router.push(
                        `/(components)/LotDetailScreen?lotId=${customerLotData.lotId}`
                      )
                    }
                  >
                    <Text className="text-white font-semibold">
                      XEM CHI TIẾT
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View className="bg-white p-4 rounded-lg shadow-md mt-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold">Address Information</Text>

              {invoiceData.status === "PendingPayment" && (
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/(components)/AddInvoiceInfor?invoiceId=${invoiceId}`
                    )
                  }
                >
                  <FontAwesome name="edit" size={18} color="gray" />
                </TouchableOpacity>
              )}
            </View>
            <Text className="font-semibold mt-2">
              {fullName || invoiceData.customerName} |{" "}
              {contactPhoneNumber || invoiceData.phone || "N/A"}
            </Text>
            <Text className="text-gray-600 text-sm">
              {address || invoiceData.address || "No address provided"}
            </Text>
          </View>

          <View className="bg-white p-4 rounded-lg shadow-md mt-6">
            <Text className="text-base font-bold">Timeline</Text>
            <View className="h-[1px] bg-gray-300 my-2" />
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
              <View>
                {/* <Text className="text-gray-600 text-sm">
                  Start time : ${invoiceData.startTime}.toLocaleString() - To
                  time: ${invoiceData.endTime}.toLocaleString()
                </Text> */}
                <Text className="font-semibold">Pending Payment</Text>
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
                      {balance.availableBalance.toLocaleString()} VNĐ
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
                selectedPaymentMethod === 3 &&
                balance?.availableBalance < invoiceData.totalAmount
              }
              className={`bg-orange-500 h-14 rounded-lg shadow-md justify-center items-center ${
                selectedPaymentMethod === 3 &&
                balance?.availableBalance < invoiceData.totalAmount
                  ? "opacity-50"
                  : ""
              }`}
            >
              <Text className="text-white font-bold text-lg">Confirm</Text>
            </TouchableOpacity>
            {selectedPaymentMethod === 3 &&
              balance?.availableBalance < invoiceData.totalAmount && (
                <Text className="text-red-500 text-center mt-2">
                  Insufficient balance. Please add funds or choose another
                  payment method.
                </Text>
              )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
