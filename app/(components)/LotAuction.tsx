import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import GlobalApi from '@/utils/GlobalApi';
import Entypo from '@expo/vector-icons/Entypo';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import LotItem from '@/components/LotItem';


interface Auction {
    id: number
    name: string
    imageUrl: string
    ordinalNumber: number
    depositAmount: number
    extimatedValue: number
    startingPrice: number
    buyNowPrice: number
    priceStep: number
    startTime: string
    expectedEndTime: string
    actualEndTime: any
    status: string
    exchangeMethod: string
    breeders: string
    varieties: string
    bornDate: string
    size: number
    gender: string
    productId: number
}

export default function LotAuction() {
    const router = useRouter();
    const numColumns = 2;
    const { id } = useLocalSearchParams();

    const [loading, setLoading] = useState(false);
    const [lotList, setLotList] = useState<Auction[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [searchValue, setSearchValue] = useState("");


    const [sortOrder, setSortOrder] = useState("");


    useEffect(() => {
        setPage(1);
        fetchAuctionList(id, searchValue, sortOrder, true);
    }, [id, searchValue, sortOrder]);

    const fetchAuctionList = async (id: any, search = "", sortOrder = "", isSearch = false) => {
        if (loading || (!hasNextPage && !isSearch)) return;
        setLoading(true);
        try {
            const response = await GlobalApi.getAuctionsById(id);
            if (response?.data?.length > 0) {
                setLotList(prevList => isSearch ? response.data : [...prevList, ...response.data]);
                setHasNextPage(response.hasNext);
            } else {
                if (isSearch) setLotList([]);
                setHasNextPage(false);
            }
        } catch (error: any) {
            console.error("Error fetching koi list:", error);
            alert("Lỗi API: " + error.message);
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 mr-1">
            <View className='flex-row justify-start'>
                <TouchableOpacity onPress={() => router.back()} className='bg-white p-2 rounded-tr-2xl rounded-bl-2xl ml-4 mt-5'>
                    <Entypo name="chevron-thin-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className='mt-6 ml-2 text-2xl font-semibold'>
                    Koi Auction Lot
                </Text>
            </View>
            <FlatList
                key={`flatlist-${numColumns}`}
                keyExtractor={(item) => item.id.toString()}
                data={lotList}
                numColumns={numColumns}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                // ListHeaderComponent={<SearchAuction onSearch={(search: any, status: any, fromDate: any, toDate: any, sortOrder: any) => {
                //     setSearchValue(search);
                //     setGender(gender);
                //     setVariety(variety);
                //     setBreeder(breeder);
                //     setType(type);
                //     setSortOrder(sortOrder);
                // }} />}
                renderItem={({ item }) => (
                    <LotItem lot={item} />
                )}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={loading ? (
                    <View className="justify-center items-center p-4">
                        <ActivityIndicator animating={true} color={MD2Colors.red800} />
                    </View>
                ) : null}
            />
        </View>
    )
}