import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import axios from "axios";
import Toast from "react-native-toast-message";

export default function OTPConfirm() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const router = useRouter();
  const { gmail, id, contractParams } = useLocalSearchParams();
  const [consignment, setConsignment] = useState<any>(null);

  useEffect(() => {
    const fetchConsignmentDetail = async () => {
      try {
        if (!id) {
          throw new Error("Consignment ID is missing");
        }

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/Consignment/Detail?id=${id}`
        );

        setConsignment(response.data);
      } catch (error) {
        console.error("Error fetching consignment details:", error);
        Alert.alert("Error", "Failed to fetch consignment details.");
      }
    };

    fetchConsignmentDetail();
  }, [id]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const createContract = async (contractData: any) => {
    try {
      console.log("Creating contract with data:", contractData);
      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/Consignment/CreateContract",
        contractData
      );
      console.log("Contract creation response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error creating contract:",
        error.response.data || error.message
      );
      throw error;
    }
  };

  const handleConfirm = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      Alert.alert("Error", "Please enter a valid 4-digit OTP.");
      return;
    }

    try {
      let contractData = {};
      if (contractParams) {
        try {
          contractData = JSON.parse(
            decodeURIComponent(contractParams as string)
          );
        } catch (e) {
          console.error("Error parsing contract params:", e);
          Alert.alert("Error", "Invalid contract parameters");
          return;
        }
      }

      const requestData = {
        email: gmail,
        otp: otpCode,
        ...contractData,
      };

      console.log("Dữ liệu gửi đi:", requestData);

      const response = await axios.post(
        `https://kfsapis.azurewebsites.net/api/Otp/verify-otp-for-contract?consignmentId=${id}`,
        requestData
      );

      console.log("Phản hồi từ server:", response.data);

      if (response.status === 200) {
        Alert.alert("Success", "OTP verified successfully!");
        if (consignment.methodOfConsignment === "Online") {
          router.push(`/(components)/consignment/OTPSuccess?id=${id}`);
        } else {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Consignment has been created successfully",
            position: "bottom",
          });
          router.push(`/(components)/consignment/ConsignmentList`);
        }
      } else {
        Alert.alert("Error", "Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Lỗi xác thực OTP:", error.response.data.Message);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center p-5 bg-white shadow-md w-full">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-100"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-bold">Confirm OTP</Text>
      </View>

      <View className="flex-1 items-center justify-start p-6 mt-10">
        <Image
          source={require("../../../assets/Logo_Team.jpg")}
          className="w-64 h-64 my-2"
          resizeMode="contain"
        />

        <Text className="text-xl font-bold mb-2 mt-4">Confirm OTP</Text>
        <Text className="text-gray-500 text-center mb-6">
          We have sent the verification code to your email address
        </Text>

        <View className="flex-row justify-center mb-6">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputs.current[index] = el!)}
              className="border border-gray-300 w-14 h-14 text-center text-lg font-bold rounded-md mx-2"
              maxLength={1}
              keyboardType="numeric"
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          className="bg-orange-500 w-full p-4 rounded-lg mt-4"
        >
          <Text className="text-white text-center font-bold">Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
