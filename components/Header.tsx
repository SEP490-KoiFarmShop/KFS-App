import { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";

interface HeaderProps {
  refreshTrigger?: number;
}

const Header = ({ refreshTrigger = 0 }: HeaderProps) => {
  const [fullName, setFullName] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [cartItems, setCartItems] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<any>([]);
  const router = useRouter();

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userData");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
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

      if (response.data && response.data.items) {
        setCart(response.data);
        setCartItems(response.data.items);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu giỏ hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData !== null) {
        const parsedData = JSON.parse(userData);
        setFullName(parsedData.fullName);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchCart();
  }, [refreshTrigger]);

  const goToCart = () => {
    router.push("/Cart");
  };

  const goToSearch = () => {
    router.push(`/KoiFishAll${searchValue ? `?search=${searchValue}` : ""}`);
  };

  return (
    <View className="pt-8 px-4 bg-orange-400 rounded-b-2xl">
      <View className="flex flex-row items-center justify-between mb-4">
        <View className="flex flex-row items-center">
          <Image
            source={require("../assets/icon/defaultavatar.png")}
            style={{ width: 45, height: 45, borderRadius: 99 }}
          />
          <View className="ml-4">
            <Text className="text-white text-lg">Welcome,</Text>
            <Text className="text-white text-xl font-bold">
              {fullName || "Guest"}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={goToCart} className="relative">
          <AntDesign name="shoppingcart" size={30} color="white" />
          {isLoggedIn && cartItems.length > 0 && (
            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {cart.itemsNumber}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex flex-row items-center bg-white rounded-full px-4 py-2 shadow-md mb-5">
        <TextInput
          placeholder="Search something ..."
          className="flex-1 text-lg text-gray-700"
          placeholderTextColor="#A0A0A0"
          value={searchValue}
          onChangeText={setSearchValue}
          onSubmitEditing={goToSearch}
          // onFocus={goToSearch}
        />
        <TouchableOpacity onPress={goToSearch}>
          <AntDesign name="search1" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
