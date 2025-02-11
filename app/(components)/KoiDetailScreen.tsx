import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import GlobalApi from '@/utils/GlobalApi';

interface Koi {
    id: string;
    name: string;
    sex: string;
    description: string;
    size: string;
    price: number;
    breeder: string;
    image: { url: string }[];
    category: { name: string };
}

export default function KoiDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [koisById, setKoisById] = useState<Koi | null>(null);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await GlobalApi.getKoisById(id);
                setKoisById(response?.kois?.[0] || []);
            } catch (error) {
                console.error("Error fetching sliders:", error);
            }
        };
        fetchCategories();
    }, [id]);
    if (!koisById) {
        return <Text>Loading...</Text>;
    }
    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN');
    };
    return (
        <View>
            <View className='flex flex-row'>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {koisById.image.length > 0 ? (
                        koisById.image.map((img, index) => (
                            <Image
                                key={index}
                                className="h-[300] m-5"
                                style={{ width: 250 }}
                                source={{ uri: img.url }}
                            />
                        ))
                    ) : (
                        <Text>No images available</Text>
                    )}
                </ScrollView>
            </View>
            <View className='m-5'>
                <Text className='font-bold text-2xl text-black ml-5'>{koisById.name}</Text>
                <Text className='font-semibold text-orange-600 mt-3 text-xl ml-5'>{formatPrice(koisById.price)} VNĐ</Text>
                <Text className='text-gray-500 mt-5'>- {koisById.description}</Text>
                <Text className='font-semibold text-xl mt-5'>Detail Information of {koisById.name} :</Text>
                <Text className='font-black text-xl mt-2'>Source:</Text>
                <TouchableOpacity onPress={() => router.push(`/KoiByBreeder?breeder=${koisById.breeder}`)}>
                    <Text className='text-blue-600 text-xl mt-1 font-medium'>{koisById.breeder}</Text>
                </TouchableOpacity>
            </View>
        </View>

    )
}