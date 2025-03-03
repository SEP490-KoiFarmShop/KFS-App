import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import GlobalApi from '@/utils/GlobalApi';
import SearchComponent from '@/components/Search';
import DetailKoiItem from '@/components/DetailKoiItem';

export default function KoiByBreeder() {
    const router = useRouter();
    const { breeder } = useLocalSearchParams();
    const [koisByBreeder, setKoisByBreeder] = useState([]);
    const numColumns = 2;
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await GlobalApi.getKoisByBreeder(breeder);
                setKoisByBreeder(response?.kois || []);
            } catch (error) {
                console.error("Error fetching sliders:", error);
            }
        };
        fetchCategories();
    }, [breeder]);
    return (
        <View className="flex-1">
            {koisByBreeder.length > 0 ?
                <FlatList
                    key={`flatlist-${numColumns}`}
                    data={koisByBreeder}
                    numColumns={numColumns}
                    ListHeaderComponent={<SearchComponent />}
                    renderItem={({ item, index }: any) => {
                        return (

                            <TouchableOpacity style={{ flex: 1, marginRight: 10 }} onPress={() => router.push(`/KoiDetailScreen?koiname=${item.name}&id=${item.id}`)}>
                                <View>
                                    <DetailKoiItem koi={item} />
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    showsVerticalScrollIndicator={false}
                />
                :
                <Text className='text-2xl text-center mt-[20%] text-gray-600'>
                    No Product Found
                </Text>
            }
        </View >
    )
}