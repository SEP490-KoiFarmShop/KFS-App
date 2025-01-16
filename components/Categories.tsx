import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import GlobalApi from '@/utils/GlobalApi';
import Heading from './Heading';
import { useRouter } from 'expo-router';

export default function Categories() {
    const router = useRouter();
    const [categories, setCategories] = useState();
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await GlobalApi.getCategories();
                setCategories(response?.categories);
            } catch (error) {
                console.error("Error fetching sliders:", error);
            }
        };
        fetchCategories();
    }, []);
    return (
        <View className='mt-5'>
            <Heading text={"Variety"} isViewAll={true} />
            <FlatList
                data={categories}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View className="w-[75px] items-center mr-5">
                        <TouchableOpacity onPress={() => router.push(`/KoiByCategory?category=${item.name}`)}>
                            <Image
                                className="w-[75px] h-[75px] rounded-full"
                                resizeMode="contain"
                                source={{ uri: item?.icon?.url }}
                            />
                            <Text className="text-center mt-2">{item.name}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    )
}