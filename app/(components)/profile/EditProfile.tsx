import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { TextInput, HelperText } from "react-native-paper";
import CustomButton from "@/components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

interface CustomerDetail {
  id: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  loyaltyPoints: number;
  totalSpending: number;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  membershipRank: string;
  image?: string;
}

interface UpdateProfilePayload {
  fullName: string;
  phoneNumber: string;
  address: string;
  image: string | null;
}

interface LocationData {
  Id: string;
  Name: string;
  Districts: District[];
}

interface District {
  Id: string;
  Name: string;
  Wards: Ward[];
}

interface Ward {
  Id: string;
  Name: string;
}

export default function EditProfile() {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [jwtToken, setJwtToken] = useState<string>("");

  // Form state
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);

  // Location data
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  // Derived data
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Form validation
  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        Alert.alert("Error", "Bạn cần đăng nhập trước!");
        router.push("/(auth)/LoginScreen");
        return;
      }

      try {
        const parsedToken = JSON.parse(userData);
        const userToken = parsedToken?.accessToken;
        setJwtToken(userToken);

        const response = await axios.get<CustomerDetail>(
          "https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        setCustomer(response.data);
        setFullName(response.data.fullName);
        setPhoneNumber(response.data.phoneNumber);

        // Parse address if it exists
        if (response.data.address) {
          parseAddress(response.data.address);
        }

        if (response.data.image) {
          setImage(response.data.image);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
      );
      setLocations(response.data);

      // Tìm và chọn sẵn TP HCM
      const hcmCity = response.data.find((city: any) =>
        city.Name.includes("Hồ Chí Minh")
      );

      if (hcmCity) {
        setSelectedCity(hcmCity.Id);
        setDistricts(hcmCity.Districts);
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  // Parse the address string to extract components
  const parseAddress = (address: string) => {
    try {
      // Example address: "123 Phan Chu Trinh, phường Tân Thành, quận Tân Phú, Thành phố Hồ Chí Minh"
      const parts = address.split(",").map((part) => part.trim());

      if (parts.length >= 1) {
        setStreetAddress(parts[0]);
      }

      // We'll set the location dropdowns when the location data is loaded
    } catch (error) {
      console.error("Error parsing address:", error);
    }
  };

  useEffect(() => {
    if (locations.length > 0 && selectedCity) {
      const cityData = locations.find((city) => city.Id === selectedCity);
      if (cityData) {
        setDistricts(cityData.Districts);
        setSelectedDistrict("");
        setSelectedWard("");
        setWards([]);
      }
    }
  }, [selectedCity, locations]);

  useEffect(() => {
    if (districts.length > 0 && selectedDistrict) {
      const districtData = districts.find(
        (district) => district.Id === selectedDistrict
      );
      if (districtData) {
        setWards(districtData.Wards);
        setSelectedWard("");
      }
    }
  }, [selectedDistrict, districts]);

  const handleUpdateProfile = async () => {
    // Validate form
    let hasError = false;
    const newErrors = {
      fullName: "",
      phoneNumber: "",
      streetAddress: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
      hasError = true;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
      hasError = true;
    } else if (!/^[0-9]{10,11}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
      hasError = true;
    }

    if (!streetAddress.trim()) {
      newErrors.streetAddress = "Vui lòng nhập địa chỉ";
      hasError = true;
    }

    if (!selectedCity || !selectedDistrict || !selectedWard) {
      Alert.alert("Lỗi", "Vui lòng chọn đầy đủ thông tin địa chỉ");
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    // Build complete address
    const cityName =
      locations.find((city) => city.Id === selectedCity)?.Name || "";
    const districtName =
      districts.find((district) => district.Id === selectedDistrict)?.Name ||
      "";
    const wardName = wards.find((ward) => ward.Id === selectedWard)?.Name || "";

    const fullAddress = `${streetAddress}, phường ${wardName}, quận ${districtName}, ${cityName}`;

    const updateData: UpdateProfilePayload = {
      fullName: fullName,
      phoneNumber: phoneNumber,
      address: fullAddress,
      image: image,
    };

    setSubmitting(true);

    try {
      await axios.put(
        "https://kfsapis.azurewebsites.net/api/v1/accounts",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Thành công", "Cập nhật thông tin thành công!");

      // Update local customer data
      if (customer) {
        setCustomer({
          ...customer,
          fullName: fullName,
          phoneNumber: phoneNumber,
          address: fullAddress,
          image: image || customer.image,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Quyền truy cập", "Cần cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Convert to base64 if not already
        let imageBase64 = result.assets[0].base64;

        if (!imageBase64 && result.assets[0].uri) {
          // Logic to convert to base64 if needed
          // This is a placeholder - actual implementation would depend on your requirements
          // setImage(result.assets[0].uri);
          Alert.alert("Thông báo", "Cần hình ảnh dạng base64");
          return;
        }

        setImage(`data:image/jpeg;base64,${imageBase64}`);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text className="mt-4 text-gray-600">Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row justify-start bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-3 mt-2">
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black text-xl font-bold p-3 mt-2">
          Thông tin cá nhân
        </Text>
      </View>

      {/* Avatar Section */}
      <View className="items-center mt-6 mb-4">
        <TouchableOpacity onPress={selectImage}>
          {image ? (
            <Image source={{ uri: image }} className="w-24 h-24 rounded-full" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center">
              <Entypo name="camera" size={32} color="#666" />
            </View>
          )}
          <Text className="text-blue-500 text-center mt-2">Thay đổi ảnh</Text>
        </TouchableOpacity>
      </View>

      {/* Form Section */}
      <View className="bg-white rounded-lg shadow-sm mx-4 p-4 mt-2">
        <Text className="text-lg font-bold mb-1">Họ và tên</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          className="bg-white border border-gray-300 rounded-lg mb-1"
          placeholder="Nhập họ tên"
          mode="outlined"
          outlineColor="#D1D5DB"
          activeOutlineColor="#FF8C00"
          error={!!errors.fullName}
        />
        {errors.fullName ? (
          <HelperText type="error" visible={!!errors.fullName}>
            {errors.fullName}
          </HelperText>
        ) : null}

        <Text className="text-lg font-bold mb-1 mt-2">Số điện thoại</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          className="bg-white border border-gray-300 rounded-lg mb-1"
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
          mode="outlined"
          outlineColor="#D1D5DB"
          activeOutlineColor="#FF8C00"
          error={!!errors.phoneNumber}
        />
        {errors.phoneNumber ? (
          <HelperText type="error" visible={!!errors.phoneNumber}>
            {errors.phoneNumber}
          </HelperText>
        ) : null}

        <Text className="text-lg font-bold mb-1 mt-2">Địa chỉ</Text>
        <TextInput
          value={streetAddress}
          onChangeText={setStreetAddress}
          className="bg-white border border-gray-300 rounded-lg mb-2"
          placeholder="Số nhà, tên đường"
          mode="outlined"
          outlineColor="#D1D5DB"
          activeOutlineColor="#FF8C00"
          error={!!errors.streetAddress}
        />
        {errors.streetAddress ? (
          <HelperText type="error" visible={!!errors.streetAddress}>
            {errors.streetAddress}
          </HelperText>
        ) : null}

        {/* Location Selects */}
        <Text className="text-lg font-bold mb-1 mt-2">Tỉnh/Thành phố</Text>
        <View className="border border-gray-300 rounded-lg mb-3 pl-2 pr-2 bg-white">
          <Picker
            selectedValue={selectedCity}
            onValueChange={(itemValue) => setSelectedCity(itemValue)}
            mode="dropdown"
          >
            <Picker.Item label="Chọn tỉnh thành" value="" />
            {locations.map((city) => (
              <Picker.Item key={city.Id} label={city.Name} value={city.Id} />
            ))}
          </Picker>
        </View>

        <Text className="text-lg font-bold mb-1">Quận/Huyện</Text>
        <View className="border border-gray-300 rounded-lg mb-3 pl-2 pr-2 bg-white">
          <Picker
            selectedValue={selectedDistrict}
            onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
            mode="dropdown"
            enabled={districts.length > 0}
          >
            <Picker.Item label="Chọn quận huyện" value="" />
            {districts.map((district) => (
              <Picker.Item
                key={district.Id}
                label={district.Name}
                value={district.Id}
              />
            ))}
          </Picker>
        </View>

        <Text className="text-lg font-bold mb-1">Phường/Xã</Text>
        <View className="border border-gray-300 rounded-lg mb-3 pl-2 pr-2 bg-white">
          <Picker
            selectedValue={selectedWard}
            onValueChange={(itemValue) => setSelectedWard(itemValue)}
            mode="dropdown"
            enabled={wards.length > 0}
          >
            <Picker.Item label="Chọn phường xã" value="" />
            {wards.map((ward) => (
              <Picker.Item key={ward.Id} label={ward.Name} value={ward.Id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Membership Info */}
      {customer && (
        <View className="bg-white rounded-lg shadow-sm mx-4 p-4 mt-4">
          <Text className="text-lg font-bold mb-2">Thông tin thành viên</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Hạng thành viên:</Text>
            <View
              className={`px-3 py-1 rounded-full ${
                customer.membershipRank === "Bronze"
                  ? "bg-amber-700"
                  : customer.membershipRank === "Silver"
                  ? "bg-gray-400"
                  : customer.membershipRank === "Gold"
                  ? "bg-yellow-500"
                  : customer.membershipRank === "Platinum"
                  ? "bg-slate-300"
                  : customer.membershipRank === "Diamond"
                  ? "bg-cyan-300"
                  : "bg-gray-300"
              }`}
            >
              <Text className="text-white font-medium">
                {customer.membershipRank}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Điểm tích lũy:</Text>
            <Text className="font-medium">{customer.loyaltyPoints} điểm</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Tổng chi tiêu:</Text>
            <Text className="font-medium">
              {customer.totalSpending
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}{" "}
              VND
            </Text>
          </View>
        </View>
      )}

      {/* Submit Button */}
      <View className="mx-4 mt-4 mb-4">
        <CustomButton
          title="Cập nhật thông tin"
          handlePress={handleUpdateProfile}
          containerStyles="bg-orange-500 h-14"
          isLoading={submitting}
        />
      </View>

      {/* Action Buttons */}
      <View className="flex-row mx-4 mb-8">
        <View className="flex-1 mr-2">
          <CustomButton
            title="Lịch sử đấu giá"
            handlePress={() => {
              console.log("Go to auction history");
            }}
            containerStyles="bg-blue-500 h-14"
            isLoading={false}
          />
        </View>
        <View className="flex-1 ml-2">
          <CustomButton
            title="Ví của bạn"
            handlePress={() => {
              router.push("/Wallet");
            }}
            containerStyles="bg-blue-500 h-14"
            isLoading={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}
