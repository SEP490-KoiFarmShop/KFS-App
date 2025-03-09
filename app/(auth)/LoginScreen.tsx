import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/auth/login",
        {
          email: email,
          password: password,
        }
      );
      if (response.status === 200) {
        if (response.data) {
          const userData = response.data;
          Alert.alert("Login Successful", "You have successfully logged in!");
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          router.push("(tabs)/home");
        }
      }
    } catch (error) {
      Alert.alert("Login Failed", "Invalid email or password");
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
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
                width: 250,
                height: 250,
                borderRadius: 175,
                marginBottom: 15,
              }}
            />
          </View>
        </SafeAreaView>
        <View>
          <Text className="font-bold text-2xl text-center">Log in</Text>
        </View>
        <View
          className="flex-1 bg-white px-8 pt-8"
          style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
        >
          <View className="form space-y-2">
            <Text className="text-gray-800 ml-4">Email Address</Text>
            <TextInput
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2 mb-4"
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View className="form space-y-2">
            <Text className="text-gray-800 ml-4">Password</Text>
            <TextInput
              secureTextEntry
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2"
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity className="flex items-end mb-5 mt-2">
              <Text className="text-gray-700">Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3 bg-orange-500 rounded-xl mt-4 pt-4 pb-4 ml-5 mr-5"
              onPress={handleLogin}
            >
              <Text className="font-xl font-bold text-center text-gray-800 text-2xl">
                Login
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xl text-gray-700 font-bold text-center py-5 mt-4">
            OR
          </Text>
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-800 font-semibold">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/SignUpScreen")}>
              <Text className="font-semibold text-orange-600">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
