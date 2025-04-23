import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import Entypo from "@expo/vector-icons/Entypo";

export default function DeliveryUpdate() {
  const { deliveryId } = useLocalSearchParams();
  const router = useRouter();

  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [cancelReasons, setCancelReasons] = useState<any[]>([]);
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>("");

  const statusOptions = [{ label: "Delivering", value: "Delivering" }];

  const statusDeliveringOptions = [
    { label: "Delivered", value: "Delivered" },
    { label: "Delivery Failed", value: "DeliveryFailed" },
    { label: "Rejected", value: "Rejected" },
  ];

  // const statusDeliveredOptions = [
  //   { label: "Delivered", value: "Delivered" },
  //   { label: "DeliveryFailed", value: "DeliveryFailed" },
  // ];

  const statusDeliveryFailedOptions = [
    { label: "Delivering", value: "Delivering" },
    { label: "DeliveryFailed", value: "DeliveryFailed" },
  ];

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
        const formData = new FormData();
        formData.append("file", {
          uri: selectedUri,
          type: "image/jpeg",
          name: `photo_${Date.now()}.jpg`,
        } as any);

        const userData = await AsyncStorage.getItem("userData");
        const jwtToken = JSON.parse(userData || "{}")?.accessToken;

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
          setImageUrls((prev) => [...prev, imageUrl]);
        } else {
          Alert.alert("Upload Failed", "No URL returned.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to upload image.");
      }
    }
  };

  useEffect(() => {
    const fetchCancelReasons = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const jwtToken = JSON.parse(userData || "{}")?.accessToken;

        const res = await axios.get(
          "https://kfsapis.azurewebsites.net/api/v1/deliveries/cancel-reason",
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        if (res.data.success) {
          const formatted = res.data.data.map((item: any) => ({
            label: item.reason,
            value: item.reason,
          }));
          setCancelReasons(formatted);
        } else {
          setCancelReasons([]);
        }
      } catch (err) {
        console.error("Failed to fetch cancel reasons", err);
      }
    };

    fetchCancelReasons();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const jwtToken = JSON.parse(userData || "{}")?.accessToken;

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/deliveries/${deliveryId}/shipper`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        if (response.data.success) {
          const detail = response.data.data;
          setDelivery(detail);
          setStatus(detail.status);
          setImageUrls(detail.pickedUpImageUrls || []);
          if (detail.cancelReason && typeof detail.cancelReason === "string") {
            setSelectedCancelReason(detail.cancelReason);
          }
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load delivery details.");
      } finally {
        setLoading(false);
      }
    };

    if (deliveryId) fetchDetail();
  }, [deliveryId]);

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const userData = await AsyncStorage.getItem("userData");
      const jwtToken = JSON.parse(userData || "{}")?.accessToken;

      const updatePayload = {
        status,
        imageUrls,
        cancelReason: selectedCancelReason,
      };

      await axios.put(
        `https://kfsapis.azurewebsites.net/api/v1/deliveries/${deliveryId}/status`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Success", "Delivery status updated.");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update delivery status.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const validateForm = () => {
    if (imageUrls.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please add at least one image to continue.",
        [{ text: "OK" }]
      );
      return false;
    }

    if (status === "DeliveryFailed" && !selectedCancelReason) {
      Alert.alert(
        "Validation Error",
        "Please select a cancel reason for failed or returned deliveries.",
        [{ text: "OK" }]
      );
      return false;
    }

    return true;
  };

  const removeImage = (index: number) => {
    const newImages = [...imageUrls];
    newImages.splice(index, 1);
    setImageUrls(newImages);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <View className="flex-row items-center bg-white shadow-md">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-100"
          >
            <Entypo name="chevron-thin-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-2xl font-bold">
            #{delivery.deliveryId} -{" "}
            <Text className="text-orange-500">Update Information</Text>
          </Text>
        </View>

        <Text className="text-xl font-bold">
          Update Delivery #{delivery.deliveryId}
        </Text>

        <View>
          <Text className="mb-2 font-medium">Status</Text>
          {status === "Assigned" && (
            <Dropdown
              style={{
                height: 50,
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
              }}
              data={statusOptions}
              labelField="label"
              valueField="value"
              placeholder="Select status"
              value={status}
              onChange={(item) => setStatus(item.value)}
            />
          )}
          {status === "Delivering" && (
            <Dropdown
              style={{
                height: 50,
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
              }}
              data={statusDeliveringOptions}
              labelField="label"
              valueField="value"
              placeholder="Select status"
              value={status}
              onChange={(item) => setStatus(item.value)}
            />
          )}
          {status === "DeliveryFailed" && (
            <Dropdown
              style={{
                height: 50,
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
              }}
              data={statusDeliveryFailedOptions}
              labelField="label"
              valueField="value"
              placeholder="Select status"
              value={status}
              onChange={(item) => setStatus(item.value)}
            />
          )}
        </View>

        {status === "DeliveryFailed" && (
          <View>
            <Text className="text-base font-medium mb-1">Cancel Reason</Text>
            <Dropdown
              style={{
                height: 50,
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
              }}
              data={cancelReasons}
              labelField="label"
              valueField="value"
              placeholder="Select cancel reason"
              value={selectedCancelReason}
              onChange={(item) => setSelectedCancelReason(item.value)}
            />
          </View>
        )}

        <View>
          <Text className="text-base font-medium">Image URLs (Compulsory)</Text>
          <TouchableOpacity
            onPress={pickImage}
            className="bg-blue-500 p-3 rounded-md my-4 items-center"
          >
            <Text className="text-white font-medium">Chọn ảnh từ thư viện</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {imageUrls.map((url, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri: url }}
                    style={{
                      width: 150,
                      height: 100,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 15,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      X
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleUpdate}
          className="bg-red-500 p-4 rounded-full items-center"
        >
          <Text className="text-white text-base font-semibold">Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
