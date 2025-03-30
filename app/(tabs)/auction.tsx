import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import AuctionItem from '@/components/AuctionItem';
import GlobalApi from '@/utils/GlobalApi';
import SearchAuction from '@/components/SearchAuction';

interface Auction {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    status: string;
    startTime: string;
    expectedEndTime: string;
    actualEndTime: string;
    totalLots: number;
}

const auction = () => {
    const router = useRouter();
    const numColumns = 1;

    const [loading, setLoading] = useState(false);
    const [auctionList, setAuctionList] = useState<Auction[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sortOrder, setSortOrder] = useState("");


    useEffect(() => {
        setPage(1);
        fetchAuctionList(1, searchValue, status, fromDate, toDate, sortOrder, true);
    }, [searchValue, status, fromDate, toDate, sortOrder]);

    const fetchAuctionList = async (pageNumber = 1, search = "", status = "", fromDate = "", toDate = "", sortOrder = "", isSearch = false) => {
        if (loading || (!hasNextPage && !isSearch)) return;
        setLoading(true);
        try {
            const response = await GlobalApi.getAuctionList(pageNumber, 10, search, status, fromDate, toDate, sortOrder);
            if (response?.data?.length > 0) {
                setAuctionList(prevList => isSearch ? response.data : [...prevList, ...response.data]);
                setPage(pageNumber);
                setHasNextPage(response.hasNext);
            } else {
                if (isSearch) setAuctionList([]);
                setHasNextPage(false);
            }
        } catch (error: any) {
            console.error("Error fetching koi list:", error);
            alert("Lỗi API: " + error.message);
        }
        setLoading(false);
    };

    return (
        <View className="flex-1">
            <View className='flex-row justify-start'>
                <TouchableOpacity onPress={() => router.back()} className='bg-white p-2 rounded-tr-2xl rounded-bl-2xl ml-4 mt-5'>
                    <Entypo name="chevron-thin-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className='mt-6 ml-2 text-2xl font-semibold'>
                    Koi Auction
                </Text>
            </View>
            <FlatList
                key={`flatlist-${numColumns}`}
                keyExtractor={(item) => item.id.toString()}
                data={auctionList}
                numColumns={numColumns}
                ListHeaderComponent={<SearchAuction onSearch={(search: any, status: any, fromDate: any, toDate: any, sortOrder: any) => {
                    setSearchValue(search);
                    // setGender(gender);
                    // setVariety(variety);
                    // setBreeder(breeder);
                    // setType(type);
                    setSortOrder(sortOrder);
                }} />}
                renderItem={({ item }) => (
                    <AuctionItem auction={item} />
                )}
                onEndReached={() => {
                    if (hasNextPage) {
                        fetchAuctionList(page + 1, searchValue, status, fromDate, toDate, sortOrder);
                    }
                }}
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

export default auction