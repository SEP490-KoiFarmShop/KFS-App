import { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImageUploadProps {
  title: string;
  onImagesSelected?: (images: string[]) => void;
}

const ImageUpload = ({ title, onImagesSelected }: ImageUploadProps) => {
  const [imageUris, setImageUris] = useState<string[]>([]);

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "You need to grant access to your gallery!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImages = result.assets.map((asset) => asset.uri);
      if (imageUris.length + selectedImages.length > 10) {
        Alert.alert("Error", "You can select up to 10 images only!");
        return;
      }
      const updatedUris = [...imageUris, ...selectedImages];
      setImageUris(updatedUris);
      onImagesSelected && onImagesSelected(updatedUris); // Gọi callback nếu có
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = imageUris.filter((_, i) => i !== index);
    setImageUris(updatedImages);
    onImagesSelected && onImagesSelected(updatedImages); // Cập nhật callback sau khi xoá
  };

  return (
    <View className="items-center p-4">
      <ScrollView horizontal>
        {imageUris.length > 0 ? (
          imageUris.map((uri, index) => (
            <View key={index} className="relative m-2">
              <Image source={{ uri }} className="w-40 h-40 rounded-lg" />
              <TouchableOpacity
                onPress={() => removeImage(index)}
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
        onPress={pickImages}
        className="mt-4 px-4 py-2 bg-blue-500 rounded"
      >
        <Text className="text-white">+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ImageUpload;