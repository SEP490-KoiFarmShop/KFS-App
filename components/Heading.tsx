import { View, Text } from 'react-native'
import React from 'react'

export default function Heading({ text, isViewAll = false }: any) {
    return (
        <View className='flex flex-row items-center justify-between'>
            <Text className='text-2xl font-bold mb-5'>{text}</Text>
            {isViewAll && <Text className='text-gray-600'>View All</Text>}
        </View>
    )
}