import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import axios, { AxiosError } from "axios";

export default function RegisterConfirm() {
  const params = useLocalSearchParams();
  const emailParam = params.email as string;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [otpValues, setOtpValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [resendEnabled, setResendEnabled] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (emailParam) {
      setUserEmail(emailParam);
      startTimer();
    } else {
      Alert.alert("Error", "No email provided. Please go back and try again.", [
        { text: "Go Back", onPress: () => router.back() },
      ]);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [emailParam]);

  const startTimer = (): void => {
    setTimeLeft(300);
    setResendEnabled(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setResendEnabled(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOtpChange = (text: string, index: number): void => {
    const numericValue = text.replace(/[^0-9]/g, "");

    const newOtpValues = [...otpValues];
    newOtpValues[index] = numericValue;
    setOtpValues(newOtpValues);

    if (numericValue && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ): void => {
    if (
      e.nativeEvent.key === "Backspace" &&
      !otpValues[index] &&
      index > 0 &&
      inputRefs[index - 1].current
    ) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const confirmEmail = async (): Promise<void> => {
    const otp = otpValues.join("");

    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP code");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `https://kfsapis.azurewebsites.net/api/v1/auth/confirm-email?email=${emailParam}&token=${otp}`
      );
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      Alert.alert(
        "Success",
        "Email confirmed successfully! You can now login to your account.",
        [{ text: "Login", onPress: () => router.push("/LoginScreen") }]
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage: any =
        axiosError.response?.data ||
        "Email confirmation failed. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = (): void => {
    Alert.alert("Info", "Resending verification code to your email");

    startTimer();

    setOtpValues(["", "", "", "", "", ""]);

    axios.post(
      `https://kfsapis.azurewebsites.net/api/v1/auth/confirm-email-otp/re-generate?email=${emailParam}`
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-2xl font-bold mb-5 text-gray-800">
          Verify Your Email
        </Text>

        <Text className="text-base text-gray-600 text-center">
          We've sent a verification code to:
        </Text>
        <Text className="text-base font-bold text-gray-800 mb-4">
          {userEmail}
        </Text>

        {/* Countdown Timer */}
        <View className="mb-4 items-center">
          <Text className="text-sm text-gray-600">Code expires in:</Text>
          <Text
            className={`text-lg font-semibold ${
              timeLeft <= 60 ? "text-red-500" : "text-gray-800"
            }`}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>

        <Text className="text-sm text-gray-600 mb-5 text-center">
          Enter the 6-digit code below to confirm your email
        </Text>

        <View className="flex-row justify-between w-4/5 mb-8">
          {otpValues.map((value, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              className="w-12 h-12 border border-gray-300 rounded-lg bg-gray-100 text-center text-lg"
              value={value}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity
          className={`bg-orange-500 py-4 px-8 rounded-xl w-4/5 items-center ${
            loading ? "opacity-70" : ""
          }`}
          onPress={confirmEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-base font-bold">Verify Email</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row mt-5">
          <Text className="text-gray-600">Didn't receive the code? </Text>
          <TouchableOpacity onPress={resendOtp} disabled={!resendEnabled}>
            <Text
              className={`font-bold ${
                resendEnabled ? "text-orange-500" : "text-gray-400"
              }`}
            >
              Resend
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-5 p-3" onPress={() => router.back()}>
          <Text className="text-gray-600 underline">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
