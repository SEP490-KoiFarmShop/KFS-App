import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImageUploadProps {
  title: string;
}

const ImageUpload = ({ title }: ImageUploadProps) => {
  const [imageUris, setImageUris] = useState<string[]>([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền bị từ chối", "Bạn cần cấp quyền để chọn ảnh!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      //   allowsEditing: true,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      let selectedImages = result.assets.map((asset) => asset.uri);
      if (imageUris.length + selectedImages.length > 3) {
        Alert.alert("Lỗi", "Chỉ được chọn tối đa 3 ảnh!");
        return;
      }
      setImageUris([...imageUris, ...selectedImages]);
    }
  };

  // Xóa ảnh khỏi danh sách
  const removeImage = (uriToRemove: string) => {
    setImageUris(imageUris.filter((uri) => uri !== uriToRemove));
  };

  return (
    <View className="items-center p-4 flex-row">
      <ScrollView horizontal>
        {imageUris.length > 0 ? (
          imageUris.map((uri, index) => (
            <View key={index} className="relative m-2">
              <Image source={{ uri }} className="w-40 h-40 rounded-lg" />
              {/* Nút xóa ảnh */}
              <TouchableOpacity
                onPress={() => removeImage(uri)}
                className="absolute top-1 right-1 bg-red-500 rounded-full p-2"
              >
                <Text className="text-white text-xs">X</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="w-40 h-40 bg-gray-200 items-center justify-center rounded-lg">
            <Text className="text-gray-500 text-xl text-center">{title}</Text>
          </View>
        )}
      </ScrollView>
      <TouchableOpacity
        onPress={pickImage}
        className="mt-4 px-4 py-2 bg-blue-500 rounded"
      >
        <Text className="text-white">+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ImageUpload;
