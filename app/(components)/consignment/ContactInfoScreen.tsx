import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import BrandHeader from "./BrandHeader";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router } from "expo-router";
const ContactInfoScreen = () => {
  return (
    <SafeAreaView className="w-full h-full bg-white">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <BrandHeader />
        <View className="items-center border-b border-gray-200 py-5">
          <Text className="text-center font-bold text-4xl w-4/5 my-3">
            Create Consignment Request
          </Text>
          <Text className="text-center font-light text-gray-500">
            Fill in the data for contact information
          </Text>
        </View>
        <View className="w-4/5 self-center mt-8 ">
          <Text className="font-bold text-2xl">Contact</Text>
          <Text className="font-light text-gray-500 mb-8">
            These contacts are used to inform about orders
          </Text>
          <View className="my-5">
            <Text className="text-lg">Phone</Text>
            <View className="flex-row items-center border-b border-gray-200 px-2">
              <SimpleLineIcons name="phone" size={24} color="black" />
              <TextInput
                placeholder="Enter your phone number"
                className="flex-1 p-2 text-lg"
              />
            </View>
          </View>
          <View className="my-5">
            <Text className="text-lg">Koi fish delivery address</Text>
            <View className="flex-row items-center border-b border-gray-200 px-2">
              <SimpleLineIcons name="location-pin" size={24} color="black" />
              <TextInput
                placeholder="Enter location"
                className="flex-1 p-2 text-lg"
              />
            </View>
          </View>
        </View>
        <View className="w-4/5 self-center mt-8 mb-10">
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-2xl shadow-lg items-center"
            onPress={() => {
              router.replace("/");
            }}
          >
            <Text className="text-white text-lg font-semibold">Finish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactInfoScreen;
