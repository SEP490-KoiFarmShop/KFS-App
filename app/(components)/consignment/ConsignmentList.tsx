import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import TableScreen from "./TableScreen";

import BrandHeader from "../BrandHeader";

const ConsignmentList = () => {
  return (
    <SafeAreaView className="w-full h-full bg-white">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <BrandHeader />
        <View className="w-4/5 self-center mt-8 ">
          <Text className="font-bold text-3xl">Consignment List</Text>
          <Text className="font-light text-gray-500 mb-8">
            Used for shipping orders
          </Text>
        </View>
        <TableScreen />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConsignmentList;
