import { View, Text, FlatList, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Heading from './Heading'
import GlobalApi from '@/utils/GlobalApi';
import LastestKoiItem from './LastestKoiItem';

export default function LatestKoi() {
    const [kois, setKois] = useState();
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await GlobalApi.getKois();
                // console.log(response?.kois)
                setKois(response?.kois);
            } catch (error) {
                console.error("Error fetching sliders:", error);
            }
        };
        fetchCategories();
    }, []);
    return (
        <View className='mt-10'>
            <Heading text={"Latest Koi for you"} isViewAll={true} />
            <FlatList
                data={kois}
                keyExtractor={(item) => item.id}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View className='mr-5'>
                        <LastestKoiItem koi={item} />
                    </View>
                )}
            />
        </View>
    )
}