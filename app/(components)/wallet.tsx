import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WalletData {
  customerId: number;
  customerName: string;
  walletId: number;
  balance: number;
  availableBalance: number;
  frozenBalance: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerDetail {
  id: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  loyaltyPoints: number;
  totalSpending: number;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  membershipRank: string;
  image: string;
  email: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

export default function Wallet() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [quickAmounts] = useState([100000, 200000, 500000, 1000000, 2000000]);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [bankList, setBankList] = useState<Bank[]>([]);
  const [matchedBank, setMatchedBank] = useState<Bank | null>(null);

  // Format currency in VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch wallet information
  const fetchWalletInfo = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const id = parsedToken?.id;
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.get(
        "https://kfsapis.azurewebsites.net/api/Wallet/GetWalletForCustomer",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setWallet(response.data);
    } catch (err) {
      setError("❌ Failed to fetch wallet data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  // Load wallet on mount
  useEffect(() => {
    fetchWalletInfo();
    fetchCustomerDetail();
    fetchBanks();
  }, [fetchWalletInfo]);

  useEffect(() => {
    if (bankList.length > 0 && customer?.bankName) {
      const bank = bankList.find(
        (b) =>
          b.code === customer.bankName ||
          b.name === customer.bankName ||
          b.shortName === customer.bankName
      );
      console.log("bank: ", bank);
      setMatchedBank(bank || null);
    }
  }, [bankList, customer]);

  const fetchBanks = async () => {
    try {
      const response = await axios.get("https://api.vietqr.io/v2/banks");
      if (response.data.data) {
        setBankList(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching banks:", err);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setDepositLoading(true);
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/Wallet/RechargeWalletForCustomer",
        null,
        {
          params: {
            moneyAmount: Number(depositAmount),
          },
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.return_code === 1) {
        Linking.openURL(response.data.order_url)
          .then(() => {
            router.push("Wallet");
          })
          .catch(() => {
            Alert.alert("Error", "Unable to open payment link.");
          });
      } else {
        Alert.alert("Error", response.data.return_message || "Deposit failed");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to process deposit.");
    } finally {
      setDepositLoading(false);
      setDepositModalVisible(false);
      setDepositAmount("");
      fetchWalletInfo();
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    // Check if withdraw amount exceeds available balance
    if (wallet && Number(withdrawAmount) > wallet.availableBalance) {
      Alert.alert("Error", "Withdrawal amount exceeds available balance");
      return;
    }

    setWithdrawLoading(true);
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const requestBody = {
        bankAccountNumber: customer?.bankAccountNumber || "",
        bankAccountName: customer?.bankAccountName || "",
        bankName: customer?.bankName || "",
        amount: Number(withdrawAmount),
      };

      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/Wallet/CreateWithdrawRequest",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle success
      Alert.alert(
        "Success",
        "Your withdrawal request has been submitted successfully. It will be processed shortly.",
        [{ text: "OK", onPress: () => fetchWalletInfo() }]
      );
    } catch (err: any) {
      console.error("Withdrawal error:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Failed to process withdrawal. Please try again later."
      );
    } finally {
      setWithdrawLoading(false);
      setWithdrawModalVisible(false);
      setWithdrawAmount("");
    }
  };

  const selectQuickAmount = (amount: number, isDeposit: boolean) => {
    if (isDeposit) {
      setDepositAmount(amount.toString());
    } else {
      setWithdrawAmount(amount.toString());
    }
  };

  const fetchCustomerDetail = async () => {
    const token = await AsyncStorage.getItem("userData");
    if (!token) {
      Alert.alert("Error", "You need to login first!");
      router.push("/(auth)/LoginScreen");
      return;
    }
    const parsedToken = JSON.parse(token);
    const jwtToken = parsedToken?.accessToken;
    try {
      setLoading(true);
      const response = await axios.get<CustomerDetail>(
        "https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      setCustomer(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setError("Unable to load customer information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-orange-500 pt-12 pb-6 rounded-b-3xl shadow-md">
        <View className="px-4 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">KFS Wallet</Text>
          <TouchableOpacity
            onPress={() => router.push("(components)/WalletTransaction")}
            className="p-2"
          >
            <Ionicons name="time-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="items-center mt-4">
          <Text className="text-white text-sm opacity-80">Total Balance</Text>
          {loading ? (
            <ActivityIndicator size="large" color="white" className="my-2" />
          ) : error ? (
            <Text className="text-white text-sm mt-2">{error}</Text>
          ) : (
            <Text className="text-white text-3xl font-bold mt-2">
              {wallet?.availableBalance
                ? formatCurrency(wallet?.availableBalance)
                : "0₫"}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchWalletInfo();
            }}
          />
        }
      >
        {/* Quick Actions */}
        <View className="bg-white mx-4 rounded-2xl p-5 shadow-sm mt-4">
          <Text className="text-gray-700 font-medium mb-4">Quick Actions</Text>
          <View className="flex-row justify-around">
            <TouchableOpacity
              className="items-center"
              onPress={() => setDepositModalVisible(true)}
              disabled={depositLoading}
            >
              <View className="bg-orange-100 w-14 h-14 rounded-full items-center justify-center mb-2">
                <FontAwesome5 name="wallet" size={20} color="#f97316" />
              </View>
              <Text className="text-sm text-gray-700">
                {depositLoading ? "Processing..." : "Deposit"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center"
              onPress={() => setWithdrawModalVisible(true)}
              disabled={withdrawLoading || (wallet?.availableBalance || 0) <= 0}
            >
              <View className="bg-blue-100 w-14 h-14 rounded-full items-center justify-center mb-2">
                <FontAwesome5
                  name="hand-holding-usd"
                  size={20}
                  color="#3b82f6"
                />
              </View>
              <Text className="text-sm text-gray-700">
                {withdrawLoading ? "Processing..." : "Withdraw"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center"
              onPress={() => router.push("/ViewWithdrawRequest")}
            >
              <View className="bg-purple-100 w-14 h-14 rounded-full items-center justify-center mb-2">
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={24}
                  color="#8b5cf6"
                />
              </View>
              <Text className="text-sm text-gray-700">View Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center"
              onPress={() => router.push("(components)/WalletTransaction")}
            >
              <View className="bg-green-100 w-14 h-14 rounded-full items-center justify-center mb-2">
                <MaterialCommunityIcons
                  name="history"
                  size={24}
                  color="#22c55e"
                />
              </View>
              <Text className="text-sm text-gray-700">History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Details */}
        {!loading && wallet && (
          <View className="bg-white mx-4 rounded-2xl p-5 shadow-sm mt-4">
            <Text className="text-gray-700 font-medium mb-4">
              Wallet Details
            </Text>

            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Available Balance</Text>
              <Text className="text-gray-800 font-medium">
                {formatCurrency(wallet.availableBalance)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Frozen Balance</Text>
              <Text className="text-gray-800 font-medium">
                {formatCurrency(wallet.frozenBalance)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3">
              <Text className="text-gray-600">Status</Text>
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    wallet.status === "Active" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <Text className="text-gray-800 font-medium">
                  {wallet.status}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={depositModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Deposit Money
              </Text>
              <TouchableOpacity onPress={() => setDepositModalVisible(false)}>
                <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-2">Enter amount (VND)</Text>
            <TextInput
              className="border border-gray-300 p-4 rounded-xl text-lg mb-4"
              keyboardType="numeric"
              placeholder="0₫"
              value={depositAmount}
              onChangeText={setDepositAmount}
            />

            <Text className="text-gray-600 mb-3">Quick amounts</Text>
            <View className="flex-row flex-wrap justify-between mb-6">
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={`deposit-${amount}`}
                  className={`py-2 px-4 mb-2 rounded-lg border ${
                    depositAmount === amount.toString()
                      ? "bg-orange-500 border-orange-500"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => selectQuickAmount(amount, true)}
                >
                  <Text
                    className={`${
                      depositAmount === amount.toString()
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {formatCurrency(amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="bg-orange-500 p-4 rounded-xl"
              onPress={handleDeposit}
              disabled={depositLoading || !depositAmount}
            >
              {depositLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-white font-bold text-lg">
                  Deposit{" "}
                  {depositAmount ? formatCurrency(Number(depositAmount)) : ""}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 p-3"
              onPress={() => setDepositModalVisible(false)}
            >
              <Text className="text-center text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={withdrawModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Withdraw Money
              </Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {(customer?.bankName ||
              customer?.bankAccountNumber ||
              customer?.bankAccountName) && (
              <InfoSection
                title="Bank Information"
                items={[
                  {
                    label: "Bank",
                    value: customer?.bankName || "Not updated",
                  },
                  {
                    label: "Account Name",
                    value: customer?.bankAccountName || "Not updated",
                  },
                  {
                    label: "Account Number",
                    value: customer?.bankAccountNumber || "Not updated",
                  },
                ]}
                matchedBank={matchedBank}
              />
            )}

            <Text className="text-gray-600 mb-2">Enter amount (VND)</Text>
            <TextInput
              className="border border-gray-300 p-4 rounded-xl text-lg mb-4"
              keyboardType="numeric"
              placeholder="0₫"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-600">Available Balance:</Text>
              <Text className="text-gray-800 font-bold">
                {wallet ? formatCurrency(wallet.availableBalance) : "0₫"}
              </Text>
            </View>

            <Text className="text-gray-600 mb-3">Quick amounts</Text>
            <View className="flex-row flex-wrap justify-between mb-6">
              {quickAmounts
                .filter((amount) => wallet && amount <= wallet.availableBalance)
                .map((amount) => (
                  <TouchableOpacity
                    key={`withdraw-${amount}`}
                    className={`py-2 px-4 mb-2 rounded-lg border ${
                      withdrawAmount === amount.toString()
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => selectQuickAmount(amount, false)}
                  >
                    <Text
                      className={`${
                        withdrawAmount === amount.toString()
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {formatCurrency(amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
              className="bg-blue-500 p-4 rounded-xl"
              onPress={handleWithdraw}
              disabled={
                withdrawLoading ||
                !withdrawAmount ||
                Number(withdrawAmount) > (wallet?.availableBalance || 0)
              }
            >
              {withdrawLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-white font-bold text-lg">
                  Withdraw{" "}
                  {withdrawAmount ? formatCurrency(Number(withdrawAmount)) : ""}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 p-3"
              onPress={() => setWithdrawModalVisible(false)}
            >
              <Text className="text-center text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper component for info sections
type InfoItem = {
  label: string;
  value: string;
  customComponent?: React.ReactNode;
};

function InfoSection({
  title,
  items,
  matchedBank,
}: {
  title: string;
  items: InfoItem[];
  matchedBank?: Bank | null;
}) {
  return (
    <View className="mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-2">{title}</Text>
      {items.map((item, index) => (
        <View key={index} className="flex-row py-2 border-b border-gray-100">
          <Text className="text-gray-500 w-1/3">{item.label}</Text>
          {title === "Bank Information" &&
          item.label === "Bank" &&
          matchedBank ? (
            <View className="flex-row items-center flex-1">
              <Image
                source={{ uri: matchedBank.logo }}
                className="w-6 h-6 mr-2"
              />
              <Text className="text-gray-800 font-medium flex-1">
                {matchedBank.name} ({matchedBank.code})
              </Text>
            </View>
          ) : (
            <Text className="text-gray-800 font-medium flex-1">
              {item.value}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
