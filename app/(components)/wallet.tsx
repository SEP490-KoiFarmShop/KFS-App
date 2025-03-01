import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';

export default function Wallet() {
    return (
        <View className="flex-1 bg-orange-500">
            {/* Header */}
            <View className="p-5 flex-row justify-between items-center">
                <Text className="text-white text-lg font-bold">ShopeePay</Text>
                <TouchableOpacity>
                    <Text className="text-white text-lg">🪙 0</Text>
                </TouchableOpacity>
            </View>

            {/* Balance */}
            <View className="p-5">
                <Text className="text-white text-sm">Tổng số dư 👁️</Text>
                <Text className="text-white text-2xl font-bold">đ4.084</Text>
            </View>

            {/* Actions */}
            <View className="bg-white rounded-lg p-4 mx-5 shadow-lg">
                <View className="flex-row justify-around">
                    <TouchableOpacity className="items-center">
                        <Text className="text-orange-500 text-lg">💰</Text>
                        <Text className="text-sm font-medium">Nạp tiền</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center">
                        <Text className="text-orange-500 text-lg">🔄</Text>
                        <Text className="text-sm font-medium">Chuyển tiền</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center">
                        <Text className="text-orange-500 text-lg">📥</Text>
                        <Text className="text-sm font-medium">QR Nhận tiền</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center">
                        <Text className="text-orange-500 text-lg">🎁</Text>
                        <Text className="text-sm font-medium">Ưu đãi</Text>
                    </TouchableOpacity>
                </View>

                {/* Notification */}
                <View className="bg-yellow-100 p-3 mt-4 rounded-lg">
                    <Text className="text-yellow-700 font-semibold">Bắt buộc: Cập nhật sinh trắc học</Text>
                    <Text className="text-gray-600 text-xs">Chuẩn bị CCCD/Căn cước (gắn chip) để quét NFC theo quy định NHNN</Text>
                </View>
            </View>

            {/* Additional Actions */}
            <View className="flex-row justify-around bg-white p-4 mt-5 mx-5 rounded-lg shadow-lg">
                <TouchableOpacity className="items-center">
                    <Text className="text-orange-500 text-lg">📱</Text>
                    <Text className="text-sm">Tải App ShopeePay</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center">
                    <Text className="text-orange-500 text-lg">🌍</Text>
                    <Text className="text-sm">Google Play</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center">
                    <Text className="text-orange-500 text-lg">🛒</Text>
                    <Text className="text-sm">Mua Hàng Trên Shopee</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center">
                    <Text className="text-orange-500 text-lg">💳</Text>
                    <Text className="text-sm">SPayLater</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
