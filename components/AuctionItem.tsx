import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

interface DetailAuctionItemProps {
    auction: {
        id: number;
        title: string;
        description: string;
        imageUrl: string;
        status: string;
        totalLots: number;
        startTime: string;
        expectedEndTime: string;
    };
}

export default function AuctionItem({ auction }: DetailAuctionItemProps) {
    const router = useRouter();
    const defaultImage = require('../assets/icon/defaultimage.jpg');

    const imageSource =
        auction?.imageUrl && auction.imageUrl !== "string"
            ? { uri: auction.imageUrl }
            : defaultImage;

    return (
        <View className="m-3 p-4 w-full max-w-[420px] bg-white rounded-lg shadow-md flex-row">
            <Image className="w-[130px] h-[130px] rounded-lg" source={imageSource} />

            <View className="flex-1 pl-4">
                <Text className="font-bold text-xl" numberOfLines={1} ellipsizeMode="tail">
                    {auction?.title || 'No Title'}
                </Text>
                <Text className="text-gray-700 text-lg" numberOfLines={2} ellipsizeMode="tail">
                    Description: {auction?.description || 'No Description'}
                </Text>
                <Text className="text-base text-gray-800">🟢 Status: {auction?.status || 'Unknown'}</Text>
                <Text className="text-base text-gray-800">📦 Total Lots: {auction?.totalLots ?? 'Unknown'}</Text>
                <Text className="text-gray-600 text-sm">
                    🕒 Start: {new Date(auction?.startTime).toLocaleString()}
                </Text>
                <Text className="text-gray-600 text-sm">
                    ⏳ End: {new Date(auction?.expectedEndTime).toLocaleString()}
                </Text>

                <TouchableOpacity
                    className="mt-3 bg-orange-500 p-3 rounded-md w-[140px] self-start"
                    onPress={() => { router.push(`/(components)/LotAuction?id=${auction.id}`) }}
                >
                    <Text className="text-white text-center text-base font-semibold">View Detail</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
