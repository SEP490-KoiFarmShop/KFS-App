import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

// Define interfaces for data structures
interface Ward {
  Id: string;
  Name: string;
}

interface District {
  Id: string;
  Name: string;
  Wards: Ward[];
}

interface Location {
  Id: string;
  Name: string;
  Districts: District[];
}

interface UserData {
  fullName: string;
  [key: string]: any; // For any other user data properties
}

export default function AddInvoiceInfor(): React.ReactElement {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  const router = useRouter();

  const [fullName, setFullName] = useState<string>("");
  const [contactPhoneNumber, setContactPhoneNumber] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [ward, setWard] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);

  // Lấy user data từ AsyncStorage
  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData !== null) {
          const parsedData: UserData = JSON.parse(userData);
          setFullName(parsedData.fullName);
        } else {
          router.push("/(auth)/LoginScreen");
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };

    fetchUserData();
  }, []);

  // Lấy dữ liệu địa phương
  useEffect(() => {
    const fetchLocations = async (): Promise<void> => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
        );
        const data: Location[] = await res.json();
        setLocations(data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu địa phương:", error);
      }
    };

    fetchLocations();
  }, []);

  // Tạo địa chỉ hoàn chỉnh
  const getFullAddress = (): string => {
    const selectedCity = locations.find((c) => c.Id === city);
    const selectedDistrict = selectedCity?.Districts.find(
      (d) => d.Id === district
    );
    return `${street}, ${ward}, ${selectedDistrict?.Name || ""}, ${
      selectedCity?.Name || ""
    }`;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
    >
      <View className="flex-1 bg-gray-100">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center p-5 bg-white shadow-md mb-5">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full bg-gray-100"
            >
              <Entypo name="chevron-thin-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="ml-4 text-2xl font-bold">
              Add Information Order
            </Text>
          </View>

          {/* Form nhập địa chỉ */}
          <View className="bg-white p-5 rounded-lg mx-3 mt-5">
            <Text className="text-gray-500 text-4xl mb-10 font-bold">
              Add Information
            </Text>

            {/* Họ tên */}
            <TextInput
              className="border-b border-gray-300 py-4 text-xl text-gray-700 mb-10 bg-gray-100"
              placeholder="Fullname"
              value={fullName}
              editable={false}
            />

            {/* Số điện thoại */}
            <TextInput
              className="border-b border-gray-300 py-4 text-xl text-gray-700 mb-10"
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={contactPhoneNumber}
              onChangeText={setContactPhoneNumber}
            />

            {/* Số nhà, tên đường */}
            <TextInput
              className="border-b border-gray-300 py-4 text-xl text-gray-700 mb-6"
              placeholder="Street address (e.g., 123 Lê Văn Sỹ)"
              value={street}
              onChangeText={setStreet}
            />

            {/* Thành phố */}
            <Picker
              selectedValue={city}
              onValueChange={(value: string) => {
                setCity(value);
                setDistrict("");
                setWard("");
              }}
              style={{ marginBottom: 16 }}
            >
              <Picker.Item label="Chọn thành phố" value="" />
              {locations.map((item) => (
                <Picker.Item key={item.Id} label={item.Name} value={item.Id} />
              ))}
            </Picker>

            {/* Quận */}
            <Picker
              selectedValue={district}
              onValueChange={(value: string) => {
                setDistrict(value);
                setWard("");
              }}
              enabled={city !== ""}
              style={{ marginBottom: 16 }}
            >
              <Picker.Item label="Chọn quận" value="" />
              {city &&
                locations
                  .find((c) => c.Id === city)
                  ?.Districts.map((d) => (
                    <Picker.Item key={d.Id} label={d.Name} value={d.Id} />
                  ))}
            </Picker>

            {/* Phường */}
            <Picker
              selectedValue={ward}
              onValueChange={(value: string) => setWard(value)}
              enabled={district !== ""}
              style={{ marginBottom: 16 }}
            >
              <Picker.Item label="Chọn phường" value="" />
              {city &&
                district &&
                locations
                  .find((c) => c.Id === city)
                  ?.Districts.find((d) => d.Id === district)
                  ?.Wards.map((w) => (
                    <Picker.Item key={w.Id} label={w.Name} value={w.Name} />
                  ))}
            </Picker>
          </View>
        </ScrollView>

        {/* Nút Confirm cố định */}
        <View className="absolute bottom-0 left-0 right-0 bg-white p-5 shadow-lg">
          <TouchableOpacity
            onPress={() => {
              if (
                !fullName ||
                !contactPhoneNumber ||
                !street ||
                !ward ||
                !district ||
                !city
              ) {
                Alert.alert("Error", "Please fill in all fields!");
                return;
              }

              const address = getFullAddress();

              router.push({
                pathname: "/InvoiceDetailScreen",
                params: {
                  invoiceId,
                  fullName,
                  contactPhoneNumber,
                  address,
                },
              });
            }}
            className="bg-orange-500 h-14 rounded-lg shadow-md justify-center items-center"
          >
            <Text className="text-white text-xl font-semibold">Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
