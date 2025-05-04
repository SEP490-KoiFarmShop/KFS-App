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
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
}

interface UpdateProfilePayload {
  fullName: string;
  phoneNumber: string;
  address: string;
  image: string | null;
  bankAccountNumber: string;
  bankAccountName: string;
  bankName: string;
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

interface Bank {
  id: string;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}

export default function EditProfile() {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [jwtToken, setJwtToken] = useState<string>("");
  const [imageUploading, setImageUploading] = useState<boolean>(false);

  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);

  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankAccountName, setBankAccountName] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [bankList, setBankList] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(true);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  const [tempWardName, setTempWardName] = useState<string>("");
  const [tempDistrictName, setTempDistrictName] = useState<string>("");
  const [tempCityName, setTempCityName] = useState<string>("");

  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankName: "",
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

        if (response.data.address) {
          parseAddress(response.data.address);
        }

        if (response.data.image) {
          setImage(response.data.image);
        }

        if (response.data.bankAccountNumber) {
          setBankAccountNumber(response.data.bankAccountNumber);
        }
        if (response.data.bankAccountName) {
          setBankAccountName(response.data.bankAccountName);
        }
        if (response.data.bankName) {
          setBankName(response.data.bankName);
        }
      } catch (error: any) {
        console.error(
          "Error fetching user:",
          error.response?.data?.Message || error.message
        );
        Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchLocationData();
    fetchBankList();
  }, []);

  const fetchBankList = async () => {
    setLoadingBanks(true);
    try {
      const response = await axios.get("https://api.vietqr.io/v2/banks");
      if (response.data && response.data.data) {
        setBankList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bank list:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách ngân hàng");
    } finally {
      setLoadingBanks(false);
    }
  };

  const fetchLocationData = async () => {
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
      );
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const parseAddress = (address: string) => {
    try {
      const parts = address.split(",").map((part) => part.trim());

      if (parts.length >= 1) {
        setStreetAddress(parts[0]);
      }

      // Extract ward
      const wardPart = parts.find((part) =>
        part.toLowerCase().includes("phường")
      );
      if (wardPart) {
        const wardName = wardPart.replace(/phường/i, "").trim();
        setTempWardName(wardName);
      }

      // Extract district
      const districtPart = parts.find(
        (part) =>
          part.toLowerCase().includes("quận") ||
          (part.toLowerCase().includes("thành phố") &&
            !part.toLowerCase().includes("tỉnh"))
      );
      if (districtPart) {
        let districtName = districtPart;
        if (districtPart.toLowerCase().includes("quận")) {
          districtName = districtPart.replace(/quận/i, "").trim();
        } else if (districtPart.toLowerCase().includes("thành phố")) {
          districtName = districtPart.replace(/thành phố/i, "").trim();
        }
        setTempDistrictName(districtName);
      }

      // Extract city/province
      const cityPart = parts.find(
        (part) =>
          part.toLowerCase().includes("tỉnh") ||
          (part.toLowerCase().includes("thành phố") &&
            !districtPart?.toLowerCase().includes("thành phố"))
      );

      if (cityPart) {
        let cityName = cityPart;
        if (cityPart.toLowerCase().includes("tỉnh")) {
          cityName = cityPart.replace(/tỉnh/i, "").trim();
        } else if (cityPart.toLowerCase().includes("thành phố")) {
          cityName = cityPart.replace(/thành phố/i, "").trim();
        }
        setTempCityName(cityName);
      }
    } catch (error) {
      console.error("Error parsing address:", error);
    }
  };

  useEffect(() => {
    if (locations.length > 0 && tempCityName) {
      // Find the city by partial name match
      const cityData = locations.find((city) =>
        city.Name.toLowerCase().includes(tempCityName.toLowerCase())
      );

      if (cityData) {
        setSelectedCity(cityData.Id);
        setDistricts(cityData.Districts);

        if (tempDistrictName) {
          const district = cityData.Districts.find((dist) =>
            dist.Name.toLowerCase().includes(tempDistrictName.toLowerCase())
          );

          if (district) {
            setSelectedDistrict(district.Id);
            setWards(district.Wards);

            if (tempWardName) {
              setTimeout(() => {
                const ward = district.Wards.find((w) =>
                  w.Name.toLowerCase().includes(tempWardName.toLowerCase())
                );

                if (ward) {
                  setSelectedWard(ward.Id);
                }
              }, 500);
            }
          }
        }
      } else {
        // Default to Ho Chi Minh City if the city is not found
        const hcmCity = locations.find((city) =>
          city.Name.includes("Hồ Chí Minh")
        );

        if (hcmCity) {
          setSelectedCity(hcmCity.Id);
          setDistricts(hcmCity.Districts);
        }
      }
    } else if (locations.length > 0 && !tempCityName) {
      // Default to Ho Chi Minh City if no city name is parsed
      const hcmCity = locations.find((city) =>
        city.Name.includes("Hồ Chí Minh")
      );

      if (hcmCity) {
        setSelectedCity(hcmCity.Id);
        setDistricts(hcmCity.Districts);
      }
    }
  }, [locations, tempCityName, tempDistrictName, tempWardName]);

  useEffect(() => {
    if (locations.length > 0 && selectedCity) {
      const cityData = locations.find((city) => city.Id === selectedCity);
      if (cityData) {
        setDistricts(cityData.Districts);
        if (!tempDistrictName) {
          setSelectedDistrict("");
          setSelectedWard("");
          setWards([]);
        }
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
        if (!tempWardName) {
          setSelectedWard("");
        }
      }
    }
  }, [selectedDistrict, districts]);

  const pickImage = async () => {
    const { status: permStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permStatus !== "granted") {
      Alert.alert("Permission denied", "We need access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;

      try {
        setImageUploading(true);
        const formData = new FormData();
        formData.append("file", {
          uri: selectedUri,
          type: "image/jpeg",
          name: `photo_${Date.now()}.jpg`,
        } as any);

        const res = await axios.post(
          "https://kfsapis.azurewebsites.net/api/v1/media",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const imageUrl = res.data?.url;
        if (imageUrl) {
          setImage(imageUrl);
        } else {
          Alert.alert("Upload Failed", "No URL returned.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại sau.");
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    // Validate form
    let hasError = false;
    const newErrors = {
      fullName: "",
      phoneNumber: "",
      streetAddress: "",
      bankAccountNumber: "",
      bankAccountName: "",
      bankName: "",
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
    } else if (streetAddress.includes(",")) {
      newErrors.streetAddress = "Địa chỉ không được chứa dấu phẩy (,)";
      hasError = true;
    }

    if (!selectedCity || !selectedDistrict || !selectedWard) {
      Alert.alert("Lỗi", "Vui lòng chọn đầy đủ thông tin địa chỉ");
      hasError = true;
    }

    if (bankAccountNumber || bankAccountName || bankName) {
      if (!bankAccountNumber.trim()) {
        newErrors.bankAccountNumber = "Vui lòng nhập số tài khoản";
        hasError = true;
      } else if (!/^\d{8,16}$/.test(bankAccountNumber)) {
        newErrors.bankAccountNumber = "Số tài khoản không hợp lệ";
        hasError = true;
      }

      if (!bankAccountName.trim()) {
        newErrors.bankAccountName = "Vui lòng nhập tên chủ tài khoản";
        hasError = true;
      }

      if (!bankName) {
        newErrors.bankName = "Vui lòng chọn ngân hàng";
        hasError = true;
      }
    }

    setErrors(newErrors);

    if (hasError) return;

    const cityName =
      locations.find((city) => city.Id === selectedCity)?.Name || "";
    const districtName =
      districts.find((district) => district.Id === selectedDistrict)?.Name ||
      "";
    const wardName = wards.find((ward) => ward.Id === selectedWard)?.Name || "";

    const fullAddress = `${streetAddress}, ${wardName}, ${districtName}, ${cityName}`;

    const updateData: UpdateProfilePayload = {
      fullName: fullName,
      phoneNumber: phoneNumber,
      address: fullAddress,
      image: image,
      bankAccountNumber: bankAccountNumber,
      bankAccountName: bankAccountName,
      bankName: bankName,
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

      if (customer) {
        setCustomer({
          ...customer,
          fullName: fullName,
          phoneNumber: phoneNumber,
          address: fullAddress,
          image: image || customer.image,
          bankAccountNumber: bankAccountNumber,
          bankAccountName: bankAccountName,
          bankName: bankName,
        });
      }
      router.push(`/profile/AboutMe`);
    } catch (error: any) {
      console.error("Error updating profile:", error.response.data.Message);
      Alert.alert(
        "Lỗi",
        error.response.data.Message || "Đã xảy ra lỗi khi cập nhật thông tin"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Custom bank picker component with logos
  const BankPickerItem = ({ bank }: { bank: Bank }) => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: bank.logo }}
          style={{ width: 24, height: 24, marginRight: 8 }}
        />
        <Text>
          {bank.name} ({bank.code})
        </Text>
      </View>
    );
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
        <TouchableOpacity onPress={pickImage} disabled={imageUploading}>
          {imageUploading ? (
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
              <ActivityIndicator size="small" color="#FF8C00" />
            </View>
          ) : image ? (
            <Image source={{ uri: image }} className="w-24 h-24 rounded-full" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center">
              <Entypo name="camera" size={32} color="#666" />
            </View>
          )}
          <Text className="text-blue-500 text-center mt-2">
            {imageUploading ? "Đang tải..." : "Thay đổi ảnh"}
          </Text>
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
            onValueChange={(itemValue) => {
              setSelectedCity(itemValue);
              // Clear temp values to let normal selection behavior take over
              setTempDistrictName("");
              setTempWardName("");
            }}
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
            onValueChange={(itemValue) => {
              setSelectedDistrict(itemValue);
              // Clear temp ward value to let normal selection behavior take over
              setTempWardName("");
            }}
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

      {/* Bank Account Section */}
      <View className="bg-white rounded-lg shadow-sm mx-4 p-4 mt-4">
        <Text className="text-lg font-bold mb-2">
          Thông tin tài khoản ngân hàng
        </Text>

        <Text className="text-lg font-bold mb-1">Chọn ngân hàng</Text>
        <View className="border border-gray-300 rounded-lg mb-3 pl-2 pr-2 bg-white">
          {loadingBanks ? (
            <View className="py-2 items-center">
              <ActivityIndicator size="small" color="#FF8C00" />
            </View>
          ) : (
            <Picker
              selectedValue={bankName}
              onValueChange={(itemValue) => setBankName(itemValue)}
              mode="dropdown"
            >
              <Picker.Item label="Chọn ngân hàng" value="" />
              {bankList.map((bank) => (
                <Picker.Item
                  key={bank.bin}
                  label={`${bank.name} (${bank.code})`}
                  value={bank.code}
                />
              ))}
            </Picker>
          )}
        </View>
        {errors.bankName ? (
          <HelperText type="error" visible={!!errors.bankName}>
            {errors.bankName}
          </HelperText>
        ) : null}

        <Text className="text-lg font-bold mb-1">Số tài khoản</Text>
        <TextInput
          value={bankAccountNumber}
          onChangeText={setBankAccountNumber}
          className="bg-white border border-gray-300 rounded-lg mb-1"
          placeholder="Nhập số tài khoản"
          keyboardType="number-pad"
          mode="outlined"
          outlineColor="#D1D5DB"
          activeOutlineColor="#FF8C00"
          error={!!errors.bankAccountNumber}
        />
        {errors.bankAccountNumber ? (
          <HelperText type="error" visible={!!errors.bankAccountNumber}>
            {errors.bankAccountNumber}
          </HelperText>
        ) : null}

        <Text className="text-lg font-bold mb-1 mt-2">Tên chủ tài khoản</Text>
        <TextInput
          value={bankAccountName}
          onChangeText={setBankAccountName}
          className="bg-white border border-gray-300 rounded-lg mb-1"
          placeholder="Nhập tên chủ tài khoản"
          mode="outlined"
          outlineColor="#D1D5DB"
          activeOutlineColor="#FF8C00"
          error={!!errors.bankAccountName}
        />
        {errors.bankAccountName ? (
          <HelperText type="error" visible={!!errors.bankAccountName}>
            {errors.bankAccountName}
          </HelperText>
        ) : null}
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

      <View className="flex-row mx-4 mb-8">
        <View className="flex-1 ml-2 mr-2">
          <CustomButton
            title="Your Wallet"
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
