import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Text,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Entypo";
import CustomButton from "@/components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Checkbox } from "react-native-paper";

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any>([]);
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: boolean;
  }>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userData");
      if (!token) {
        Alert.alert(
          "Login Required",
          "You need to login first. Would you like to go to the login page?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => router.push("/(tabs)/home"),
            },
            {
              text: "Login",
              onPress: () => router.push("/(auth)/LoginScreen"),
            },
          ]
        );
        return;
      }
      const parsedToken = JSON.parse(token);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.get(
        `https://kfsapis.azurewebsites.net/api/Cart/GetCartAndItemsInside`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data.items);

      if (response.data && response.data.items) {
        setCartItems(response.data.items);
        setTotalPrice(
          response.data.items.reduce(
            (sum: any, item: any) => sum + item.price * item.quantity,
            0
          )
        );

        // Reset selected items when cart changes
        // Only pre-select available items
        const newSelectedItems: { [key: string]: boolean } = {};
        response.data.items.forEach((item: any) => {
          if (item.isAvailable) {
            // Only pre-select items that were previously selected and are available
            if (selectedItems[item.productId]) {
              newSelectedItems[item.productId] = true;
            }
          }
        });
        setSelectedItems(newSelectedItems);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "Failed to load cart items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data) {
          setUserData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch user information:", err);
      }
    };

    fetchUserDetail();
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCart();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const removeFromCart = async (koiFishIds: number[]) => {
    try {
      setIsRemoveLoading(true);
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        Alert.alert("Error", "You need to login first!");
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.put(
        "https://kfsapis.azurewebsites.net/api/v1/carts/products-removed",
        {
          koiFishIds: koiFishIds,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle successful removal
      console.log("Items removed from cart:", response.data);

      // Clear selected items that were removed
      const newSelectedItems = { ...selectedItems };
      koiFishIds.forEach((id) => {
        delete newSelectedItems[id];
      });
      setSelectedItems(newSelectedItems);

      // Refresh cart after removal
      fetchCart();

      // Show success message
      Alert.alert("Success", "Items removed from cart successfully!");

      return response.data;
    } catch (error) {
      console.error("Error removing items from cart:", error);
      Alert.alert(
        "Error",
        "Failed to remove items from cart. Please try again."
      );
    } finally {
      setIsRemoveLoading(false);
    }
  };

  const handleRemoveItem = (productId: number) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removeFromCart([productId]) },
      ]
    );
  };

  const handleRemoveSelected = () => {
    const selectedKoiFishIds = Object.keys(selectedItems)
      .filter((id) => selectedItems[id])
      .map((id) => Number(id));

    if (selectedKoiFishIds.length === 0) {
      Alert.alert("Warning", "No items selected");
      return;
    }

    Alert.alert(
      "Remove Selected Items",
      `Are you sure you want to remove ${selectedKoiFishIds.length} selected items from your cart?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removeFromCart(selectedKoiFishIds) },
      ]
    );
  };

  const submit = async () => {
    try {
      const selectedKoiFishIds = Object.keys(selectedItems)
        .filter((id) => selectedItems[id])
        .map((id) => Number(id));

      if (selectedKoiFishIds.length === 0) {
        Alert.alert("Warning", "No items selected for checkout");
        return;
      }

      // Check if any selected item is unavailable
      const unavailableItems = cartItems.filter(
        (item: any) => selectedItems[item.productId] && !item.isAvailable
      );

      if (unavailableItems.length > 0) {
        Alert.alert(
          "Unavailable Items",
          "Some selected items are currently unavailable for purchase. Please remove them before checkout.",
          [{ text: "OK" }]
        );
        return;
      }

      setIsLoading(true);
      const token = await AsyncStorage.getItem("userData");
      if (!token) {
        Alert.alert("Error", "You need to login first!");
        router.push("/(auth)/LoginScreen");
        return;
      }
      const parsedToken = JSON.parse(token);
      const jwtToken = parsedToken?.accessToken;

      console.log("Selected Koi Fish IDs:", selectedKoiFishIds);

      const queryString = selectedKoiFishIds
        .map((id) => `koi-fish-ids=${id}`)
        .join("&");
      const url = `https://kfsapis.azurewebsites.net/api/v1/orders/check-out?${queryString}`;
      console.log("Checkout URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      router.push(`/OrderDetail?orderId=${selectedKoiFishIds.join("x")}`);
    } catch (error: any) {
      console.error("Error during checkout:", error.response);
      Alert.alert("Error", "Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheckbox = (productId: number) => {
    // Check if the item is available before allowing selection
    const item = cartItems.find((item: any) => item.productId === productId);

    if (!item.isAvailable) {
      Alert.alert(
        "Item Unavailable",
        "This item is currently unavailable and cannot be selected for checkout."
      );
      return;
    }

    setSelectedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const selectAll = () => {
    if (cartItems.length === 0) return;

    // Get only available items
    const availableItems = cartItems.filter((item: any) => item.isAvailable);

    if (availableItems.length === 0) {
      Alert.alert(
        "No Available Items",
        "There are no available items to select."
      );
      return;
    }

    // Check if all available items are already selected
    const allAvailableSelected = availableItems.every(
      (item: any) => selectedItems[item.productId]
    );

    // Create new selection state
    const newSelectedItems: { [key: string]: boolean } = {};

    if (allAvailableSelected) {
      // If all were selected, deselect all (empty object)
    } else {
      // Otherwise select all available items
      availableItems.forEach((item: any) => {
        newSelectedItems[item.productId] = true;
      });
    }

    setSelectedItems(newSelectedItems);
  };

  // Calculate available items count
  const availableItemsCount = cartItems.filter(
    (item: any) => item.isAvailable
  ).length;

  // Calculate selected items count
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  // Calculate selected items total price
  const selectedTotalPrice = cartItems
    .filter((item: any) => selectedItems[item.productId])
    .reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  return (
    <View className="flex-1 bg-gray-100">
      <SafeAreaView className="flex-1">
        {/* Go Back */}
        <View className="flex-row items-center justify-between p-5 bg-white shadow-md">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full bg-gray-100"
            >
              <Entypo name="chevron-thin-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-2xl font-bold">Your Cart</Text>
          </View>
          {cartItems.length > 0 && (
            <TouchableOpacity
              onPress={handleRemoveSelected}
              disabled={isRemoveLoading || selectedCount === 0}
              className={`px-4 py-2 rounded-lg ${
                selectedCount > 0 ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <Text className="text-white font-medium">
                {isRemoveLoading ? "Removing..." : "Remove Products"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cart Items */}
        {isLoading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <Text>Loading cart items...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#FF6B00"]}
                tintColor="#FF6B00"
                title="Refreshing cart..."
                titleColor="#FF6B00"
              />
            }
          >
            {cartItems.length > 0 ? (
              cartItems.map((item: any, index: any) => (
                <View
                  key={index}
                  className={`bg-white rounded-lg shadow-md mx-4 p-4 flex-row items-center mt-5 ${
                    !item.isAvailable ? "border-2 border-red-300" : ""
                  }`}
                >
                  <Checkbox
                    status={
                      selectedItems[item.productId] ? "checked" : "unchecked"
                    }
                    onPress={() => toggleCheckbox(item.productId)}
                    color="#FF6B00"
                    disabled={!item.isAvailable}
                  />
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : require("../../assets/icon/defaultimage.jpg")
                    }
                    className={`w-[70px] h-[70px] rounded-lg shadow-md ${
                      !item.isAvailable ? "opacity-50" : ""
                    }`}
                    resizeMode="contain"
                  />
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center">
                      <Text
                        className={`font-bold text-lg ${
                          !item.isAvailable ? "text-gray-500" : "text-gray-800"
                        }`}
                      >
                        {item.name}
                      </Text>
                    </View>
                    <Text
                      className={`${
                        !item.isAvailable ? "text-gray-400" : "text-gray-600"
                      } text-sm`}
                    >
                      Quantity: {item.quantity}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`font-semibold text-lg ${
                        !item.isAvailable ? "text-gray-400" : "text-orange-500"
                      }`}
                    >
                      {item.price.toLocaleString()} VND
                    </Text>
                    {!item.isAvailable && (
                      <View className="ml-2 px-2 py-1 bg-red-100 rounded">
                        <Text className="text-xs text-red-600 font-medium">
                          Unavailable
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.productId)}
                      className="p-2 mt-2"
                    >
                      <Entypo name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-center text-gray-500 mt-10">
                  Your cart is empty
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(components)/KoiFishAll")}
                  className="mt-4 bg-orange-500 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold">Shop Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* Checkout Section */}
        {cartItems.length > 0 && (
          <View className="absolute bottom-0 left-0 right-0 bg-white p-5 shadow-lg">
            {/* Shopee Voucher Section */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 font-semibold">
                Koi Farm Shop Membership
              </Text>
              <TouchableOpacity className="bg-orange-100 px-3 py-1 rounded-md">
                <Text className="text-yellow-600 text-sm font-medium">
                  {userData?.membershipRank}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Availability info */}
            {/* {availableItemsCount < cartItems.length && (
              <View className="bg-yellow-50 p-2 rounded mb-2">
                <Text className="text-yellow-700 text-xs">
                  {cartItems.length - availableItemsCount} item(s) in your cart{" "}
                  {cartItems.length - availableItemsCount > 1 ? "are" : "is"}{" "}
                  currently unavailable and cannot be checked out.
                </Text>
              </View>
            )} */}

            {/* Select All & Total Price Section */}
            <View className="mb-3">
              {/* Select All Section - First Row */}
              <View className="flex-row items-center justify-between mb-2">
                <TouchableOpacity
                  onPress={selectAll}
                  className="flex-row items-center"
                >
                  <Checkbox
                    status={
                      availableItemsCount > 0 &&
                      selectedCount === availableItemsCount
                        ? "checked"
                        : "unchecked"
                    }
                    color="#FF6B00"
                  />
                  <Text
                    className="ml-2 text-gray-700 font-semibold truncate text-sm"
                    numberOfLines={1}
                    style={{ maxWidth: "70%" }}
                  >
                    Select All ({selectedCount}/{availableItemsCount})
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-600 text-xs">
                  Available items only
                </Text>
              </View>

              {/* Total Price Section - Second Row */}
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-700">Total amount:</Text>
                <View className="items-end">
                  <Text className="text-lg font-bold text-orange-600">
                    {selectedTotalPrice.toLocaleString()} VND
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    Save:{" "}
                    {Math.round(selectedTotalPrice * 0.05).toLocaleString()} VND
                  </Text>
                </View>
              </View>
            </View>

            <CustomButton
              title={`Checkout (${selectedCount} items)`}
              handlePress={submit}
              containerStyles={`${
                selectedCount > 0 ? "bg-orange-500" : "bg-gray-300"
              } h-14 rounded-lg shadow-md mt-5`}
              isLoading={isLoading}
              disabled={selectedCount === 0}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
