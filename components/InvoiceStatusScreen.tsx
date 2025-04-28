import { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function InvoiceStatusScreen({ status }: any) {
  const [invoices, setInvoices] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);

  const fetchInvoices = async (page: any, isRefreshing = false) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }
      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.get(
        `https://kfsapis.azurewebsites.net/api/v1/auction-invoices/customer?status=${status}&page-number=${page}&page-size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const fetchedData = response.data.data;
        if (page === 1 || isRefreshing) {
          setInvoices(fetchedData);
          setHasMore(fetchedData.length === pageSize);
        } else {
          setInvoices((prev: any) => [...prev, ...fetchedData]);
          if (fetchedData.length < pageSize) {
            setHasMore(false);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
      setRefreshing(false);
    }
  };

  const loadMoreInvoices = () => {
    if (!fetchingMore && hasMore) {
      setFetchingMore(true);
      setPageNumber((prev) => prev + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPageNumber(1);
    setHasMore(true);
    fetchInvoices(1, true);
  };

  useEffect(() => {
    fetchInvoices(pageNumber);
  }, [pageNumber]);

  const renderFooter = () => {
    if (!fetchingMore) return null;
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        style={{ marginVertical: 20 }}
      />
    );
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatPrice = (price: any) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  const renderInvoiceItem = ({ item }: any) => (
    <TouchableOpacity
      className="bg-white p-4 mx-4 my-2 rounded-xl shadow"
      onPress={() =>
        router.push(
          `/(components)/InvoiceDetailScreen?invoiceId=${item.invoiceId}`
        )
      }
    >
      <View className="flex-row items-center mb-2">
        {status === "InvoiceCreated" && (
          <View className="bg-yellow-400 py-1 px-3 rounded-md">
            <Text className="text-white font-bold">CREATE INVOICE</Text>
          </View>
        )}
        <Text className="text-gray-500 ml-auto">
          {formatDate(item.startTime)} - {formatDate(item.endTime)}
        </Text>
      </View>

      <Text className="text-gray-500">
        Invoice #{item.invoiceId} - Lot #{item.lotId}
      </Text>

      <View className="flex-row mt-3">
        <View>
          <Image
            source={{ uri: item.imageUrl }}
            className="w-24 h-24 rounded-lg"
          />
          {status === "Paid" ||
            (status === "PendingPayment" && (
              <View className="bg-green-400 py-1 px-4 rounded-md mt-2 items-center">
                <Text className="text-white font-bold">You Win !!!</Text>
              </View>
            ))}
        </View>
        <View className="ml-4 flex-1 justify-center">
          <Text className="text-2xl font-bold">{item.name}</Text>
          <Text className="text-gray-500 mt-1">Type: Auction</Text>
          <Text className="font-semibold mt-1">
            SOLD: {formatPrice(item.soldAtPrice)}
          </Text>
          <Text className="text-gray-500">
            Your max bid: {formatPrice(item.yourMaxBid)}
          </Text>
          <Text className="text-gray-500">
            Have Paid: {status === "Paid" ? "Yes" : "No"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" className="mt-5" />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.invoiceId.toString()}
          renderItem={renderInvoiceItem}
          onEndReached={loadMoreInvoices}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingVertical: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0000ff"]}
              tintColor="#0000ff"
            />
          }
        />
      )}
    </View>
  );
}
