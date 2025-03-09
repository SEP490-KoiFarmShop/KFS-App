import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import GlobalApi from '@/utils/GlobalApi';
import DetailKoiItem from '@/components/DetailKoiItem';
import SearchComponent from '@/components/Search';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';

export default function KoiByCategory() {
    const router = useRouter();
    const { category } = useLocalSearchParams();
    const [koisByCategory, setKoisByCategory] = useState([]);
    const numColumns = 2;
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
        <View className="flex-1">
            {koisByCategory.length > 0 ?
                <FlatList
                    key={`flatlist-${numColumns}`}
                    data={koisByCategory}
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
                    <View className="justify-center items-center">
                        <ActivityIndicator animating={true} color={MD2Colors.red800} />
                    </View>
                </Text>
            }
        </View >
    )
}