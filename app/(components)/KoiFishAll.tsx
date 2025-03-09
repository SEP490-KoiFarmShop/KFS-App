import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import GlobalApi from '@/utils/GlobalApi';
import DetailKoiItem from '@/components/DetailKoiItem';
import SearchComponent from '@/components/Search';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import Entypo from '@expo/vector-icons/Entypo';


interface Koi {
    id: number;
    name: string;
    quantity: number;
    price: number;
    type: string;
    status: string;
    exchangeMethod: string;
    breeders: string;
    varieties: string;
    bornDate: string;
    size: number;
    gender: string;
}

export default function KoiFishAll() {
    const router = useRouter();

    const [koisList, setKoisList] = useState<Koi[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [searchValue, setSearchValue] = useState("");

    const numColumns = 2;

    useEffect(() => {
        setPage(1);
        fetchKoisList(1, searchValue, true);
    }, [searchValue]);

    const fetchKoisList = async (pageNumber = 1, search = "", isSearch = false) => {
        if (loading || (!hasNextPage && !isSearch)) return;
        setLoading(true);

        try {
            const response = await GlobalApi.getKoisList(pageNumber, 10, search);
            // console.log("API Response:", response.data);

            if (response?.data?.length > 0) {
                setKoisList(prevList => isSearch ? response.data : [...prevList, ...response.data]);
                setPage(pageNumber);
                setHasNextPage(response.hasNext);
            } else {
                if (isSearch) setKoisList([]);
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
                    Koi Fish
                </Text>
            </View>
            <FlatList
                key={`flatlist-${numColumns}`}
                keyExtractor={(item) => item.id.toString()}
                data={koisList}
                numColumns={numColumns}
                ListHeaderComponent={<SearchComponent onSearch={setSearchValue} />}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={{ flex: 1, marginRight: 10 }}
                        onPress={() => router.push(`/KoiDetailScreen?koiname=${item.name}&id=${item.id}`)}
                    >
                        <DetailKoiItem koi={item} />
                    </TouchableOpacity>
                )}
                onEndReached={() => fetchKoisList(page + 1, searchValue)}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={loading ? (
                    <View className="justify-center items-center p-4">
                        <ActivityIndicator animating={true} color={MD2Colors.red800} />
                    </View>
                ) : null}
            />
        </View>
    );
}
