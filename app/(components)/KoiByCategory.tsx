import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import GlobalApi from '@/utils/GlobalApi';
import DetailKoiItem from '@/components/DetailKoiItem';

export default function KoiByCategory() {
    const router = useRouter();
    const { category } = useLocalSearchParams();
    const [koisByCategory, setKoisByCategory] = useState([]);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await GlobalApi.getKoisByCategory(category);
                setKoisByCategory(response?.kois || []);
            } catch (error) {
                console.error("Error fetching sliders:", error);
            }
        };
        fetchCategories();
    }, [category]);
    return (
        <View>
            {koisByCategory.length > 0 ?
                < FlatList
                    data={koisByCategory}
                    renderItem={({ item, index }: any) => {
                        return (
                            <TouchableOpacity onPress={() => router.push(`/KoiDetailScreen?koiname=${item.name}&id=${item.id}`)}>
                                <View>
                                    <DetailKoiItem koi={item} />
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                />
                :
                <Text className='text-2xl text-center mt-[20%] text-gray-600'>
                    No Product Found
                </Text>
            }
        </View >
    )
}