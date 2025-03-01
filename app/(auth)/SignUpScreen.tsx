import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
const SignUpScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{ backgroundColor: "white" }}
    >
      <ScrollView>
        {/* <View className='flex-1 bg-white' style={{ backgroundColor: "orange" }}></View> */}
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
        <View className="">
          <Text className="font-bold text-2xl text-center">Sign Up</Text>
        </View>
        <View
          className="flex-1 bg-white px-8 pt-8"
          style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
        >
          <View className="form space-y-2">
            <Text className="text-gray-800 ml-4">Email Address</Text>
            <TextInput
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2 mb-4"
              placeholder=""
            />
          </View>
          <View className="form space-y-2">
            <Text className="text-gray-800 ml-4">Password</Text>
            <TextInput
              secureTextEntry
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2"
              placeholder=""
            />
          </View>
          <View className="form space-y-2 mt-3">
            <Text className="text-gray-800 ml-4">Confirm Password</Text>
            <TextInput
              secureTextEntry
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mt-2"
              placeholder=""
            />
          </View>
          <TouchableOpacity className="py-4 bg-orange-500 rounded-xl my-5">
            <Text className="font-xl font-bold text-center text-gray-800">
              Sign Up
            </Text>
          </TouchableOpacity>
          <Text className="text-xl text-gray-700 font-bold text-center ">
            OR
          </Text>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-800 font-semibold">
              Already have an account ?{" "}
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
