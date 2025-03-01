import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';

export default function Wallet() {
    const router = useRouter();
    return (
        <View className="flex-1 bg-orange-500">

            {/* Header */}
            <View className='flex-row justify-start'>
                <TouchableOpacity onPress={() => router.back()} className='bg-white p-2 rounded-tr-2xl rounded-bl-2xl ml-4 mt-5'>
                    <Entypo name="chevron-thin-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold mt-7 ml-5">ShopeePay</Text>
            </View>

            <View></View>

            {/* Balance */}
            <View className="p-5">
                <Text className="text-white text-sm">Total balance 👁️</Text>
                <Text className="text-white text-2xl font-bold">đ4.084</Text>
            </View>

            {/* Actions */}
            <View className="bg-white rounded-lg p-4 mx-5 shadow-lg">
                <View className="flex-row justify-around">
                    <TouchableOpacity className="items-center">
                        <Text className="text-orange-500 text-lg">💰</Text>
                        <Text className="text-sm font-medium">Deposit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center">
                        <Text className="text-orange-500 text-lg">🔄</Text>
                        <Text className="text-sm font-medium">Withdraw</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center">
                        <Text className="text-orange-500 text-lg">📥</Text>
                        <Text className="text-sm font-medium">Transaction History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center">
                        <Text className="text-orange-500 text-lg">🎁</Text>
                        <Text className="text-sm font-medium">Incentive Policy</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className='bg-white p-2 rounded-t-2xl mt-5 h-full'>
                {/* Text  */}
            </View>
        </View>
    );
}
