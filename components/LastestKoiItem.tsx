import { View, Text, Image } from 'react-native';
import React from 'react';

interface LastestKoiItemProps {
    koi: any;
}

export default function LastestKoiItem({ koi }: LastestKoiItemProps) {
    // Hàm định dạng giá
    const formatPrice = (price: number = 0) => {
        return price.toLocaleString('vi-VN');
    };

    // Kiểm tra xem có hình ảnh hợp lệ không, nếu không dùng hình mặc định
    const imageSource =
        koi?.image && Array.isArray(koi.image) && koi.image.length > 0 && koi.image[0]?.url
            ? { uri: koi.image[0].url }
            : require('../assets/icon/defaultimage.jpg');

    return (
        <View className="m-5 p-[10] w-[180] h-[270] bg-white rounded-[10]">
            <Image className="w-[160] h-[100] rounded-[10]" source={imageSource} />
            <View className="p-[7] flex gap-[3]">
                <Text className="w-[160] font-semibold" numberOfLines={1} ellipsizeMode="tail">
                    {koi?.name || 'Unknown'}
                </Text>
                <Text className="w-[160] font-semibold" numberOfLines={1} ellipsizeMode="tail">
                    Variety: {koi?.varieties || 'Unknown'}
                </Text>
                <Text>
                    Sex: {koi?.gender || 'Unknown'}
                </Text>
                <Text>
                    Size: {koi?.size ? `${koi.size} cm` : 'Unknown'}
                </Text>
                <Text className="font-bold text-xl mt-3">
                    {formatPrice(koi?.price || 0)} VNĐ
                </Text>
            </View>
        </View>
    );
}
