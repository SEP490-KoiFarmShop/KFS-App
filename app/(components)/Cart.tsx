import { View, TouchableOpacity, ScrollView, Image, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import CustomButton from '@/components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Checkbox } from 'react-native-paper';

export default function Cart() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<any>([]);
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setIsLoading(true);
                const userData = await AsyncStorage.getItem("userData");
                if (!userData) {
                    router.push("/(auth)/LoginScreen");
                    return;
                }

                const parsedToken = JSON.parse(userData);
                const id = parsedToken?.id;
                const jwtToken = parsedToken?.accessToken;

                const response = await axios.get(`https://kfsapis.azurewebsites.net/api/Cart/GetCartAndItemsInside`
                    ,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.data && response.data.items) {
                    setCartItems(response.data.items);
                    setTotalPrice(response.data.items.reduce((sum: any, item: any) => sum + item.price * item.quantity, 0));
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu giỏ hàng:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCart();
    }, []);

    const submit = async () => {
        try {
            const selectedKoiFishIds = Object.keys(selectedItems).filter(id => selectedItems[id]);

            if (selectedKoiFishIds.length === 0) {
                console.warn("Không có sản phẩm nào được chọn.");
                return;
            }

            setIsLoading(true);
            const token = await AsyncStorage.getItem("userData");
            if (!token) {
                Alert.alert("Error", "You need to login first!");
                router.push('/(auth)/LoginScreen');
                return;
            }
            const parsedToken = JSON.parse(token);
            const jwtToken = parsedToken?.accessToken;

            const queryString = selectedKoiFishIds.map(id => `koi-fish-ids=${id}`).join("&");

            const url = `https://kfsapis.azurewebsites.net/api/v1/orders/check-out?${queryString}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
            });
            router.push(`/OrderDetail?orderId=${selectedKoiFishIds.join("x")}`);
        } catch (error: any) {
            console.error("Lỗi khi checkout:", error.response);
        } finally {
            setIsLoading(false);
        }
    };



    const toggleCheckbox = (koiFishId: string) => {
        // console.log("Toggling item ID:", koiFishId);
        setSelectedItems((prev) => ({
            ...prev,
            [koiFishId]: !prev[koiFishId],
        }));
    };

    return (
        <View className='flex-1 bg-gray-100'>
            <SafeAreaView className='flex-1'>
                {/* Go Back */}
                <View className='flex-row items-center p-5 bg-white shadow-md'>
                    <TouchableOpacity onPress={() => router.back()} className='p-2 rounded-full bg-gray-100'>
                        <Entypo name="chevron-thin-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className='ml-4 text-2xl font-bold'>Your Cart</Text>
                </View>

                {/* Cart Items */}
                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}>
                    {cartItems.length > 0 ? cartItems.map((item: any, index: any) => (
                        <TouchableOpacity
                            key={index}
                            className="bg-white rounded-lg shadow-md mx-4 p-4 flex-row items-center mt-5"
                            onPress={() => toggleCheckbox(item.koiFishId)}
                            activeOpacity={0.7}
                        >
                            <Checkbox
                                status={selectedItems[item.koiFishId] ? 'checked' : 'unchecked'}
                                onPress={() => toggleCheckbox(item.koiFishId)}
                                color="#FF6B00"
                            />
                            <Image
                                source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/icon/defaultimage.jpg")}
                                className="w-[70px] h-[70px] rounded-lg shadow-md"
                                resizeMode='contain'
                            />
                            <View className="ml-3 flex-1">
                                <Text className="font-bold text-lg text-gray-800">{item.name}</Text>
                                <Text className="text-gray-600 text-sm">Số lượng: {item.quantity}</Text>
                            </View>
                            <Text className="font-semibold text-lg text-orange-500">{item.price.toLocaleString()} VND</Text>
                        </TouchableOpacity>
                    )) : (
                        <Text className="text-center text-gray-500 mt-10">Giỏ hàng trống</Text>
                    )}
                </ScrollView>


                {/* Checkout Section */}
                <View className='relative bottom-0 left-0 right-0 bg-white p-5 shadow-lg '>

                    {/* Shopee Voucher Section */}
                    <View className='flex-row items-center justify-between mb-2'>
                        <Text className='text-gray-700 font-semibold'>Koi Farm Shop Membership</Text>
                        <TouchableOpacity className='bg-orange-100 px-3 py-1 rounded-md'>
                            <Text className='text-yellow-600 text-sm font-medium'>Gold</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Use Membership */}
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <Entypo name="wallet" size={20} color="#FFA500" />
                            <Text className="ml-2 text-gray-700 font-medium">5% discount by membership</Text>
                        </View>
                        <Checkbox status="checked" color="#FF6B00" />
                    </View>

                    {/* Select All & Total Price Section */}
                    <View className='flex-row items-center justify-between mb-3'>
                        <View className='flex-row items-center'>
                            <Checkbox status="unchecked" color="#FF6B00" />
                            <Text className='ml-2 text-gray-700 font-semibold'>Tất cả</Text>
                        </View>
                        <View className='items-end'>
                            <Text className='text-lg font-bold text-orange-600'>
                                Tổng thanh toán {totalPrice.toLocaleString()} VND
                            </Text>
                            <Text className='text-gray-500 text-sm'>Tiết kiệm đ102k</Text>
                        </View>
                    </View>

                    <CustomButton title="Check out" handlePress={submit}
                        containerStyles="bg-orange-500 h-14 rounded-lg shadow-md mt-5"
                        isLoading={isLoading}
                    />
                </View>
            </SafeAreaView>
        </View>
    )
}
