import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import CustomButton from '@/components/CustomButton';

export default function Cart() {
    const router = useRouter();
    const isLoading = false;

    const submit = async () => {
    };
    return (
        <View className='flex-1 bg-white' style={{ backgroundColor: "white" }}>
            <SafeAreaView className='flex-1'>
                {/* Go Back */}
                <View className='flex-row justify-start'>
                    <TouchableOpacity onPress={() => router.back()} className='bg-white p-2 rounded-tr-2xl rounded-bl-2xl ml-4 mt-5'>
                        <Entypo name="chevron-thin-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className='mt-6 ml-2 text-2xl font-semibold'>
                        Your Cart
                    </Text>
                </View>
                {/* Remove All */}
                <TouchableOpacity className="mr-10 ml-auto">
                    <Text className="text-gray-700">Remove All</Text>
                </TouchableOpacity>
                {/* Cart Item */}
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="bg-gray-100 rounded-lg mx-4 p-3 flex-row items-center mt-10">
                        <Image
                            source={{ uri: "https://us-west-2.graphassets.com/cm5sq0qzf0mrk07n0fiaxdrhy/cm5uvvr5m4ywz07lixruyxgpe" }}
                            className="w-[60px] h-[60px] rounded-lg"
                        />
                        <View className="ml-3 flex-1">
                            <Text className="font-bold text-lg">Kohaku 90 cm 6 tuổi</Text>
                            <Text className="text-gray-600 text-sm">Size - 90 cm  |  <Text className="font-semibold">Dainichi Koi Farm</Text></Text>
                        </View>
                        <Text className="font-semibold text-lg">$148</Text>
                    </View>
                    <View className="bg-gray-100 rounded-lg mx-4 p-3 flex-row items-center mt-10">
                        <Image
                            source={{ uri: "https://us-west-2.graphassets.com/cm5sq0qzf0mrk07n0fiaxdrhy/cm5uvvr5m4ywz07lixruyxgpe" }}
                            className="w-[60px] h-[60px] rounded-lg"
                        />
                        <View className="ml-3 flex-1">
                            <Text className="font-bold text-lg">Kohaku 90 cm 6 tuổi</Text>
                            <Text className="text-gray-600 text-sm">Size - 90 cm  |  <Text className="font-semibold">Dainichi Koi Farm</Text></Text>
                        </View>
                        <Text className="font-semibold text-lg">$148</Text>
                    </View>
                    {/* Membership */}
                    <View className="mt-16 px-4">
                        <Text className="text-2xl font-semibold">Membership:</Text>
                        <Text className="text-5xl font-extrabold text-yellow-500 text-center">GOLD</Text>
                    </View>
                    {/* Summary */}
                    <View className="mt-10 px-4">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700 text-xl">Subtotal</Text>
                            <Text className="text-gray-700 text-xl">$148</Text>
                        </View>
                        <View className="flex-row justify-between mt-1">
                            <Text className="text-gray-700 text-xl">Shipping Cost</Text>
                            <Text className="text-gray-700 text-xl">$8.00</Text>
                        </View>
                        <View className="flex-row justify-between mt-1">
                            <Text className="text-orange-500 font-semibold text-xl">Membership: Gold</Text>
                            <Text className="text-orange-500 font-semibold text-xl">- $5.00</Text>
                        </View>
                        <View className="flex-row justify-between mt-2 border-t border-gray-300 pt-2">
                            <Text className="font-semibold text-2xl">Total</Text>
                            <Text className="font-semibold text-2xl">$151</Text>
                        </View>
                    </View>

                </ScrollView>
                {/* Checkout */}
                <View className='absolute bottom-5 left-0 right-0 px-5'>
                    <CustomButton title="Check out" handlePress={submit}
                        containerStyles="mt-auto bg-orange-500 h-14 mr-5 ml-5"
                        isLoading={isLoading}
                    />
                </View>
            </SafeAreaView>
        </View>
    )
}