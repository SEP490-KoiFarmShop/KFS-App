import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import axios from "axios";

const SignUpScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!fullName || !email || !phoneNumber || !password) {
      Alert.alert("Error", "All fields are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    const params = {
      fullName,
      email,
      password,
      phoneNumber,
    };
    // console.log("Sign Up Params:", params);

    setLoading(true);
    try {
      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/auth/register",
        params
      );

      if (response.data) {
        Alert.alert("Success", "Account created successfully! Please login.", [
          {
            text: "OK",
            onPress: () => router.push(`/RegisterConfirm?email=${email}`),
          },
        ]);
      }
    } catch (error: any) {
      const errorMessage =
        error.response.data.Message || "Registration failed. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{ backgroundColor: "white" }}
    >
      <ScrollView>
        <SafeAreaView className="flex">
          <View className="flex-row justify-start">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white p-2 rounded-tr-2xl rounded-bl-2xl ml-4 mt-5"
            >
              <Entypo name="chevron-thin-left" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center mt-2">
            <Image
              source={require("../../assets/Logo_Team.jpg")}
              style={{
                width: 200,
                height: 200,
                borderRadius: 175,
                marginBottom: 15,
              }}
            />
          </View>
        </SafeAreaView>
        <View className="">
          <Text className="font-bold text-2xl text-center">Sign Up</Text>
        </View>
        <View
          className="flex-1 bg-white px-8 pt-8"
          style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
        >
          <View className="form space-y-2">
            <Text className="text-gray-800 ml-4">Full Name</Text>
            <TextInput
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2 mb-4"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View className="form space-y-2">
            <Text className="text-gray-800 ml-4">Email Address</Text>
            <TextInput
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2 mb-4"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="form space-y-2">
            <Text className="text-gray-800 ml-4">Phone Number</Text>
            <TextInput
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2 mb-4"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View className="form space-y-2">
            <Text className="text-gray-800 ml-4">Password</Text>
            <TextInput
              secureTextEntry
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2 mb-4"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>

          {/* <View className="form space-y-2">
            <Text className="text-gray-800 ml-4">Confirm Password</Text>
            <TextInput
              secureTextEntry
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2 mb-4"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View> */}

          <TouchableOpacity
            className="py-4 bg-orange-500 rounded-xl my-5"
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-xl font-bold text-center text-gray-800">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-xl text-gray-700 font-bold text-center">
            OR
          </Text>

          <View className="flex-row justify-center mt-4 mb-6">
            <Text className="text-gray-800 font-semibold">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
              <Text className="font-semibold text-orange-600">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
