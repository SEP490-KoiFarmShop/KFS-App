import { View, Text, Image } from "react-native";
import React from "react";
const logo = require("../../../assets/Logo_Team.jpg");

const BrandHeader = () => {
  return (
    <View className="flex-row items-center border-b border-gray-300">
      <Image
        source={logo}
        className="w-[70px] h-[70px] rounded-full mx-3 my-3"
      />
      <Text className="font-semibold text-sm">Koi Farm Shop</Text>
    </View>
  );
};

export default BrandHeader;
