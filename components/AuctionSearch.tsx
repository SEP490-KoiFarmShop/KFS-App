import React, { useState } from "react";
import { View, TextInput, Text } from "react-native";
import CustomButton from "./CustomButton";

export default function AuctionSearch({ onSearch }: any) {
  const [searchValue, setSearchValue] = useState("");

  const submit = () => {
    onSearch(searchValue);
  };

  return (
    <View className="p-4 bg-white shadow-md rounded-xl mx-4 mt-4">
      <Text className="text-lg font-semibold text-gray-800 mb-3">
        Search Auction
      </Text>

      <View className="flex-row items-center space-x-3">
        <View className="flex-1">
          <TextInput
            className="border border-gray-300 rounded-lg px-3 h-11 bg-gray-50 text-base text-gray-800"
            placeholder="Enter name..."
            value={searchValue}
            onChangeText={setSearchValue}
            style={{ paddingVertical: 2 }}
          />
        </View>

        <CustomButton
          title="Search"
          handlePress={submit}
          containerStyles="bg-blue-500 px-5 py-3 rounded-lg ml-2"
          textStyles="text-white font-semibold text-base"
        />
      </View>
    </View>
  );
}
