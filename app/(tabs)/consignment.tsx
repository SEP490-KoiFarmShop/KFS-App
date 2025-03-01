import { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Checkbox } from "react-native-paper";
import BrandHeader from "../(components)/BrandHeader";
import ConsignmentTermsModal from "../(components)/ConsignmentTermsModal";
import ImageUpload from "../(components)/ImageUpload";

const consignment = () => {
  const [checked, setChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  return (
    <SafeAreaView className="w-full h-full bg-white">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <BrandHeader />
        <View className="items-center border-b border-gray-200 py-5">
          <Text className="text-center font-bold text-4xl w-4/5 my-3">
            Create Consignment Request
          </Text>
          <Text className="text-center font-light text-gray-500">
            Fill in the data for profile. It will take a couple of minutes.
          </Text>
          <View className="flex-row items-center space-x-2 ">
            <Checkbox
              status={checked ? "checked" : "unchecked"}
              onPress={() => setChecked(!checked)}
            />
            <View className="flex-row items-center">
              <Text className="text-gray-700">I agree with </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text className="text-blue-500 underline">Terms of use</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Modal */}
          <ConsignmentTermsModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
          />
        </View>
        {/* Form */}
        <View className="w-4/5 self-center mt-8  ">
          <Text className="font-bold text-2xl">Individual Koi data</Text>
          <Text className="font-light text-gray-500">
            Fill basic information for making request
          </Text>
          <View className="my-5">
            <Text className="text-lg">Variety</Text>
            <TextInput className="border-b border-gray-200 " />
          </View>
          <View className="my-5">
            <Text className="text-lg">Age</Text>
            <TextInput className="border-b border-gray-200 " />
          </View>
          <View className="my-5">
            <Text className="text-lg">Date of birth</Text>
            <TextInput className="border-b border-gray-200 " />
          </View>
          <View className="my-5">
            <Text className="text-lg">Sex</Text>
            <TextInput className="border-b border-gray-200 " />
          </View>
          <View className="my-5">
            <Text className="text-lg">Source</Text>
            <TextInput className="border-b border-gray-200 " />
          </View>
          <View className="my-5">
            <Text className="text-lg">Desired Price</Text>
            <TextInput className="border-b border-gray-200 " />
          </View>
          <View className="my-5">
            <Text className="text-lg">Health History</Text>
            <TextInput className="border-b border-gray-200 " />
          </View>
          <ImageUpload title="Upload Koi picture (3 max)" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default consignment;
