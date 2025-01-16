import { View, Text, Image } from 'react-native'
import React from 'react'

export default function DetailKoiItem({ koi }: any) {
    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN');
    };
    return (
        <View className='m-5 p-[10] w-[180] h-[270] bg-white rounded-[10]'>
            <Image className='w-[160] h-[100] rounded-[10]' source={{ uri: koi?.image[0]?.url }} />
            <View className='p-[7] flex gap-[3]'>
                <Text className='w-[160] font-semibold' numberOfLines={1} ellipsizeMode="tail">{koi.name}</Text>
                <Text className='mt-3'>Variety: {koi.category.name}</Text>
                <Text>Sex: {koi.sex}</Text>
                <Text>Size: {koi.size} cm</Text>
                <Text className='font-bold text-xl mt-3'>{formatPrice(koi.price)} VNĐ</Text>
            </View>
        </View>
    )
}