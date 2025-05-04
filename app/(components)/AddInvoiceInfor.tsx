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
import CustomButton from "@/components/CustomButton";
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
  [key: string]: any;
}

export default function AddInvoiceInfor(): React.ReactElement {
  const params = useLocalSearchParams<{
    invoiceId: string;
    fullName?: string;
    phoneNumber?: string;
    address?: string;
  }>();

  // console.log(params);

  const router = useRouter();
  const invoiceId = params.invoiceId;
  const isEditing = !!(params.fullName && params.phoneNumber && params.address);

  const [fullName, setFullName] = useState<string>(params.fullName || "");
  const [contactPhoneNumber, setContactPhoneNumber] = useState<string>(
    params.phoneNumber || ""
  );
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [ward, setWard] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper function to clean location names
  const cleanLocationName = (name: string): string => {
    // Remove prefixes like "phường", "quận" etc.
    return name
      .replace(/^phường\s+/i, "")
      .replace(/^quận\s+/i, "")
      .replace(/^thành\s+phố\s+/i, "")
      .replace(/^tỉnh\s+/i, "")
      .trim();
  };

  // Fetch user data from AsyncStorage (only if not editing)
  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      if (isEditing) return; // Skip if we're editing existing data

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
  }, [isEditing]);

  // Parse existing address if editing
  useEffect(() => {
    if (isEditing && params.address) {
      const addressParts = params.address.split(", ");

      // Set street address (first part)
      if (addressParts.length >= 1) {
        setStreet(addressParts[0]);
      }

      // Set ward (second part) - store the raw value temporarily
      if (addressParts.length >= 2) {
        // We'll handle ward selection after locations are loaded
        const rawWardName = addressParts[1].replace(/^phường\s+/i, "");
        setWard(rawWardName);
      }

      // district and city will be matched once the location data is loaded
    }
  }, [isEditing, params.address]);

  // Fetch location data
  useEffect(() => {
    const fetchLocations = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
        );
        const data: Location[] = await res.json();
        setLocations(data);

        // If editing, try to match city and district from existing address
        if (isEditing && params.address && data.length > 0) {
          const addressParts = params.address.split(", ");

          // Get district name (third part) and city name (fourth part)
          let districtName = addressParts.length >= 3 ? addressParts[2] : "";
          let cityName = addressParts.length >= 4 ? addressParts[3] : "";

          // Clean the names to improve matching
          districtName = cleanLocationName(districtName);
          cityName = cleanLocationName(cityName);

          // Find matching city using more flexible matching
          const matchingCity = data.find((c) => {
            const cleanCityName = cleanLocationName(c.Name);
            return (
              cleanCityName.includes(cityName) ||
              cityName.includes(cleanCityName)
            );
          });

          if (matchingCity) {
            setCity(matchingCity.Id);

            // Find matching district using more flexible matching
            const matchingDistrict = matchingCity.Districts.find((d) => {
              const cleanDistrictName = cleanLocationName(d.Name);
              return (
                cleanDistrictName.includes(districtName) ||
                districtName.includes(cleanDistrictName)
              );
            });

            if (matchingDistrict) {
              setDistrict(matchingDistrict.Id);

              // Now try to match the ward
              const wardName =
                addressParts.length >= 2
                  ? cleanLocationName(addressParts[1])
                  : "";

              // Find the matching ward
              const matchingWard = matchingDistrict.Wards.find((w) => {
                const cleanWardName = cleanLocationName(w.Name);
                return (
                  cleanWardName.includes(wardName) ||
                  wardName.includes(cleanWardName)
                );
              });

              if (matchingWard) {
                setWard(matchingWard.Name);
              }
            }
          }
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu địa phương:", error);
        Alert.alert("Error", "Failed to load location data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [isEditing, params.address]);

  // Find city, district and ward objects safely
  const selectedCity = locations.find((c) => c.Id === city);
  const selectedDistrict = selectedCity?.Districts?.find(
    (d) => d.Id === district
  );
  const districts = selectedCity?.Districts || [];
  const wards = selectedDistrict?.Wards || [];

  // Generate full address
  const getFullAddress = (): string => {
    return `${street}, ${ward}, ${selectedDistrict?.Name || ""}, ${
      selectedCity?.Name || ""
    }`;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
    >
      <View className="flex-1">
        {/* Scrollable Content */}
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
              {isEditing ? "Edit Order Information" : "Add Order Information"}
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white p-5 rounded-lg mx-3 mt-5">
            <Text className="text-gray-500 text-4xl mb-10 font-bold">
              {isEditing ? "Edit Information" : "Add Information"}
            </Text>

            {/* Full Name (non-editable) */}
            <TextInput
              className="border-b border-gray-300 py-4 text-xl text-gray-700 mb-10 bg-gray-100"
              placeholder="Fullname"
              value={fullName}
              editable={false}
            />

            {/* Phone Number */}
            <TextInput
              className="border-b border-gray-300 py-4 text-xl text-gray-700 mb-10"
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={contactPhoneNumber}
              onChangeText={setContactPhoneNumber}
            />

            {/* Street Address */}
            <TextInput
              className="border-b border-gray-300 py-4 text-xl text-gray-700 mb-6"
              placeholder="Street address (e.g., 123 Lê Văn Sỹ)"
              value={street}
              onChangeText={setStreet}
            />

            {isLoading ? (
              <Text className="text-center py-4">Loading location data...</Text>
            ) : (
              <>
                {/* City Selection */}
                <View className="border-b border-gray-300 mb-6">
                  <Picker
                    selectedValue={city}
                    onValueChange={(value: string) => {
                      setCity(value);
                      setDistrict("");
                      setWard("");
                    }}
                  >
                    <Picker.Item label="Chọn tỉnh thành" value="" />
                    {locations.map((item) => (
                      <Picker.Item
                        key={item.Id}
                        label={item.Name}
                        value={item.Id}
                      />
                    ))}
                  </Picker>
                </View>

                {/* District Selection */}
                <View className="border-b border-gray-300 mb-6">
                  <Picker
                    selectedValue={district}
                    onValueChange={(value: string) => {
                      setDistrict(value);
                      setWard("");
                    }}
                    enabled={city !== ""}
                  >
                    <Picker.Item label="Chọn quận huyện" value="" />
                    {districts.map((d) => (
                      <Picker.Item key={d.Id} label={d.Name} value={d.Id} />
                    ))}
                  </Picker>
                </View>

                {/* Ward Selection */}
                <View className="border-b border-gray-300 mb-6">
                  <Picker
                    selectedValue={ward}
                    onValueChange={(value: string) => setWard(value)}
                    enabled={district !== ""}
                  >
                    <Picker.Item label="Chọn phường xã" value="" />
                    {wards.map((w) => (
                      <Picker.Item key={w.Id} label={w.Name} value={w.Name} />
                    ))}
                  </Picker>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Fixed Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white p-5 shadow-lg">
          <CustomButton
            title={isEditing ? "Update" : "Confirm"}
            handlePress={() => {
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
                params: { invoiceId, fullName, contactPhoneNumber, address },
              });
            }}
            containerStyles="bg-orange-500 h-14 rounded-lg shadow-md"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
