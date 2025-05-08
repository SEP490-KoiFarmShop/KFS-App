import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";

interface DetailLotItemProps {
  lot: any;
}

export default function LotItem({ lot }: DetailLotItemProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("");

  const formatPrice = (price: number = 0) => {
    return price.toLocaleString("vi-VN");
  };

  const imageUrls = lot?.imageUrl
    ? lot.imageUrl.split(", ").map((url: string) => url.trim())
    : [];

  const imageSource =
    imageUrls.length > 0
      ? { uri: imageUrls[0] }
      : require("../assets/icon/defaultimage.jpg");

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (!lot?.expectedEndTime) return;

    const updateCountdown = () => {
      const endTimeObj = new Date(lot.expectedEndTime);
      endTimeObj.setHours(endTimeObj.getHours() - 7);

      const endTime = endTimeObj.getTime();
      const now = new Date().getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("Auction ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lot?.expectedEndTime]);

  return (
    <TouchableOpacity
      className="m-3 p-[10] w-[180] h-[400] bg-white rounded-[10]"
      onPress={() =>
        router.push(`/(components)/LotDetailScreen?lotId=${lot?.id}`)
      }
    >
      <Image className="w-[160] h-[100] rounded-[10]" source={imageSource} />
      <View className="p-[7] flex gap-[3]">
        <Text
          className="w-[160] font-bold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {lot?.name || "Unknown"}
        </Text>
        <Text className="mt-2" numberOfLines={1} ellipsizeMode="tail">
          Variety: {lot?.varieties || "Unknown"}
        </Text>
        <Text>Sex: {lot?.gender || "Unknown"}</Text>
        <Text>Size: {lot?.size ? `${lot.size} cm` : "Unknown"}</Text>
        <Text numberOfLines={1} ellipsizeMode="tail">
          Est value: {formatPrice(lot?.extimatedValue || 0)} đ
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail">
          Breeder: {lot?.breeders || "Unknown"}
        </Text>
        <Text>Status: {lot?.status}</Text>
        <Text className="font-medium text-gray-600">
          Start at: {formatDate(lot?.startTime)}
        </Text>
        {lot?.status === "Auctioning" && (
          <Text className="font-semibold text-red-500 text-lg mt-3">
            {timeLeft}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
