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
    RefreshControl
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function Wallet() {
    const router = useRouter();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [depositLoading, setDepositLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [depositAmount, setDepositAmount] = useState("");
    const [refreshing, setRefreshing] = useState(false);

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

            const response = await axios.get('https://kfsapis.azurewebsites.net/api/Wallet/GetWalletForCustomer', {
                params: { customerId: id },
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
            });

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
    }, [fetchWalletInfo]);

    // Handle deposit
    const handleDeposit = async () => {
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
                'https://kfsapis.azurewebsites.net/api/Wallet/RechargeWalletForCustomer',
                null,
                {
                    params: { moneyAmount: Number(depositAmount) },
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
                        Alert.alert("Lỗi", "Không thể mở liên kết thanh toán.");
                    });
            } else {
                Alert.alert("Error", response.data.return_message || "Deposit failed");
            }
        } catch (err) {
            Alert.alert("Error", "Failed to process deposit.");
        } finally {
            setDepositLoading(false);
            setModalVisible(false);
            setDepositAmount("");
            fetchWalletInfo();
        }
    };

    return (
        <View className="flex-1 bg-orange-500">
            <View className="flex-row justify-start">
                <TouchableOpacity onPress={() => router.back()} className="bg-white p-2 rounded-tr-2xl rounded-bl-2xl ml-4 mt-5">
                    <Entypo name="chevron-thin-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold mt-7 ml-5">KFS Wallet</Text>
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => {
                        setRefreshing(true);
                        fetchWalletInfo();
                    }} />
                }
            >
                <View className="p-5">
                    {loading ? (
                        <ActivityIndicator size="large" color="white" />
                    ) : error ? (
                        <Text className="text-white text-sm">{error}</Text>
                    ) : (
                        <>
                            <Text className="text-white text-sm">Total balance 👁️</Text>
                            <Text className="text-white text-2xl font-bold">
                                {wallet?.balance ? wallet.balance.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "đ0"}
                            </Text>
                        </>
                    )}
                </View>

                <View className="bg-white rounded-lg p-4 mx-5 shadow-lg">
                    <View className="flex-row justify-around">
                        <TouchableOpacity className="items-center" onPress={() => setModalVisible(true)} disabled={depositLoading}>
                            <Text className="text-orange-500 text-lg">💰</Text>
                            <Text className="text-sm font-medium">
                                {depositLoading ? "Processing..." : "Deposit"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="items-center">
                            <Text className="text-orange-500 text-lg">🔄</Text>
                            <Text className="text-sm font-medium">Withdraw</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="items-center">
                            <Text className="text-orange-500 text-lg">📥</Text>
                            <Text className="text-sm font-medium">Transaction History</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity className="items-center">
                            <Text className="text-orange-500 text-lg">🎁</Text>
                            <Text className="text-sm font-medium">Incentive Policy</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </ScrollView>

            <View className="bg-white p-2 rounded-t-2xl mt-5 h-[65%]">
                <Modal visible={modalVisible} animationType="slide" transparent={true}>
                    <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                        <View className="bg-white w-80 p-5 rounded-lg shadow-lg">
                            <Text className="text-lg font-bold text-center">Enter Deposit Amount</Text>
                            <TextInput
                                className="border border-gray-300 p-2 rounded mt-4 text-center"
                                keyboardType="numeric"
                                placeholder="Nhập số tiền (VND)"
                                value={depositAmount}
                                onChangeText={setDepositAmount}
                            />
                            <Text className="text-center mt-2 text-gray-600">
                                {depositAmount ? Number(depositAmount).toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : ""}
                            </Text>
                            <View className="flex-row justify-between mt-5">
                                <TouchableOpacity
                                    className="bg-gray-300 p-3 rounded-lg w-1/3"
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text className="text-center font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-orange-500 p-3 rounded-lg w-1/3"
                                    onPress={handleDeposit}
                                    disabled={depositLoading}
                                >
                                    <Text className="text-center text-white font-medium">
                                        {depositLoading ? "Processing..." : "Confirm"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>


        </View>
    );
}
