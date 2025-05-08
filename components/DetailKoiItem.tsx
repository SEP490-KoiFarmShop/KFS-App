import { View, Text, Image } from "react-native";
import React from "react";

interface DetailKoiItemProps {
  koi: any;
}

export default function DetailKoiItem({ koi }: DetailKoiItemProps) {
  const formatPrice = (price: number = 0) => {
    return price.toLocaleString("vi-VN");
  };

  const imageUrls = koi?.imageUrl
    ? koi.imageUrl.split(", ").map((url: string) => url.trim())
    : [];

  const imageSource =
    imageUrls.length > 0
      ? { uri: imageUrls[0] }
      : require("../assets/icon/defaultimage.jpg");

  return (
    <View className="m-5 p-[10] w-[180] h-[310] bg-white rounded-[10]">
      <Image className="w-[160] h-[100] rounded-[10]" source={imageSource} />
      <View className="p-[7] flex gap-[3]">
        <Text
          className="w-[160] font-bold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {koi?.name || "Unknown"}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail">
          Variety: {koi?.varieties || "Unknown"}
        </Text>
        <Text>Sex: {koi?.gender || "Unknown"}</Text>
        <Text>Type: {koi?.type || "Unknown"}</Text>
        {koi?.type === "KoiIndividual" && (
          <Text>Size: {koi?.size ? `${koi.size} cm` : "Unknown"}</Text>
        )}
        {koi?.type === "KoiPack" && (
          <Text>
            Size: {`${koi.fromSize} -  ${koi.toSize} cm` || "Unknown"}
          </Text>
        )}
        <Text className="font-semibold text-orange-500 text-xl mt-3">
          {formatPrice(koi?.price || 0)} VNĐ
        </Text>
      </View>
    </View>
  );
}
