import { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { Checkbox } from "react-native-paper";
import BrandHeader from "../(components)/consignment/BrandHeader";
import ConsignmentTermsModal from "../(components)/consignment/ConsignmentTermsModal";
import { router, useRouter } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";


const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Unknown', value: 'unknown' },
];

const consingmentOptions = [
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
];

const sellingOptions = [
  { label: 'Fixed Price', value: 'sell' },
  { label: 'Auction', value: 'auction' },
];

const uploadImage = async (uri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'image.jpg',
    type: 'image/jpeg',
  } as any);

  try {
    const response = await fetch('https://kfsapis.azurewebsites.net/api/v1/media', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    if (response.ok) {
      return result.url;
    } else {
      console.error('Upload failed:', result);
      alert('Image upload failed');
      return null;
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('An error occurred during image upload');
    return null;
  }
};

const pickImages = async (setImages: (images: string[]) => void, images: string[]) => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
    alert("Permission to access gallery is required!");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 1,
  });

  if (!result.canceled && result.assets.length > 0) {
    const uploadedUrls = await Promise.all(
      result.assets.map(async (asset) => {
        const uploadedUrl = await uploadImage(asset.uri);
        return uploadedUrl;
      })
    );

    const validUrls = uploadedUrls.filter((url) => url !== null);
    setImages([...images, ...validUrls]);
  }
};

const removeImage = (setImages: (images: string[]) => void, images: string[], index: number) => {
  const updatedImages = images.filter((_, i) => i !== index);
  setImages(updatedImages);
};


const submitConsignment = async (data: any) => {
  const userData = await AsyncStorage.getItem("userData");
  if (!userData) {
    router.push("/(auth)/LoginScreen");
    return;
  }

  const parsedToken = JSON.parse(userData);
  const id = parsedToken?.id;
  const jwtToken = parsedToken?.accessToken;
  try {
    console.log(data)
    const response = await axios.post('https://kfsapis.azurewebsites.net/api/Consignment', data,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      })
    alert('Consignment created successfully!');
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    alert('Failed to create consignment');
  }
};

const consignment = () => {
  const [checked, setChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const router = useRouter();
  const [gender, setGender] = useState(null);
  const [consignment, setConsignment] = useState(null);
  const [selling, setSelling] = useState(null);
  const [koiImages, setKoiImages] = useState<string[]>([]);
  const [certificateImages, setCertificateImages] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [variety, setVariety] = useState('');
  const [source, setSource] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupDate, setPickUpDate] = useState(new Date());

  const [showPicker, setShowPicker] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);

  const [isDateSelected, setIsDateSelected] = useState(false);
  const [isFromDateSelected, setIsFromDateSelected] = useState(false);
  const [isToDateSelected, setIsToDateSelected] = useState(false);
  const [isPickUpDateSelected, setIsPickUpDateSelected] = useState(false);


  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    const consignmentData = {
      varieties: variety,
      gender,
      source,
      methodOFSelling: selling,
      methodOfConsignment: consignment,
      bornDate: format(date, 'yyyy-MM-dd'),
      fromDate: format(fromDate, 'yyyy-MM-dd'),
      toDate: format(toDate, 'yyyy-MM-dd'),
      pickupDate: format(pickupDate, 'yyyy-MM-dd'),
      desiredPrice: parseFloat(desiredPrice),
      notes: notes,
      imageUrls: koiImages,
      certificateUrls: certificateImages,
    };

    submitConsignment(consignmentData);
  };

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
            <TextInput className="border-b border-gray-200 " value={variety}
              onChangeText={setVariety} />
          </View>
          <View className="my-5">
            <Text className="text-lg">Date of birth</Text>

            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              className="border-b border-gray-200 py-3"
            >
              <Text>
                {isDateSelected ? date.toLocaleDateString('en-GB') : 'Select a date'}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) {
                    setDate(selectedDate);
                    setIsDateSelected(true);
                  }
                }}
              />
            )}
          </View>
          <View className="my-5">
            <Text className="text-lg mb-4">Sex</Text>
            <Dropdown
              data={genderOptions}
              labelField="label"
              valueField="value"
              placeholder="Select gender"
              value={gender}
              onChange={(item) => setGender(item.value)}
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                paddingHorizontal: 10,
                backgroundColor: 'white',
              }}
              placeholderStyle={{ color: '#6b7280', fontSize: 16 }}
              selectedTextStyle={{ fontSize: 16, color: '#1f2937', fontWeight: 'semibold' }}
            />
          </View>
          <View className="my-5">
            <Text className="text-lg">Source</Text>
            <TextInput className="border-b border-gray-200 " value={source}
              onChangeText={setSource} />
          </View>
          <View className="my-5">
            <Text className="text-lg mb-4">Method of Consignment</Text>
            <Dropdown
              data={consingmentOptions}
              labelField="label"
              valueField="value"
              placeholder="Select method of consignment"
              value={consignment}
              onChange={(item) => setConsignment(item.value)}
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                paddingHorizontal: 10,
                backgroundColor: 'white',
              }}
              placeholderStyle={{ color: '#6b7280', fontSize: 16 }}
              selectedTextStyle={{ fontSize: 16, color: '#1f2937', fontWeight: 'semibold' }}
            />
          </View>
          <View className="my-5">
            <Text className="text-lg mb-4">Method of Selling</Text>
            <Dropdown
              data={sellingOptions}
              labelField="label"
              valueField="value"
              placeholder="Select method of selling"
              value={selling}
              onChange={(item) => setSelling(item.value)}
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                paddingHorizontal: 10,
                backgroundColor: 'white',
              }}
              placeholderStyle={{ color: '#6b7280', fontSize: 16 }}
              selectedTextStyle={{ fontSize: 16, color: '#1f2937', fontWeight: 'semibold' }}
            />
          </View>

          <View className="my-5">
            <Text className="text-lg">Desired Price</Text>
            <TextInput className="border-b border-gray-200 " value={desiredPrice}
              onChangeText={setDesiredPrice} />
          </View>

          <View className="my-5">
            <Text className="text-lg">From date</Text>

            <TouchableOpacity
              onPress={() => setShowFromDatePicker(true)}
              className="border-b border-gray-200 py-3"
            >
              <Text>
                {isFromDateSelected ? fromDate.toLocaleDateString('en-GB') : 'Select a date'}
              </Text>
            </TouchableOpacity>

            {showFromDatePicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  setShowFromDatePicker(false);
                  if (selectedDate) {
                    setFromDate(selectedDate);
                    setIsFromDateSelected(true);
                  }
                }}
              />
            )}
          </View>
          <View className="my-5">
            <Text className="text-lg">To date</Text>

            <TouchableOpacity
              onPress={() => setShowToDatePicker(true)}
              className="border-b border-gray-200 py-3"
            >
              <Text>
                {isToDateSelected ? toDate.toLocaleDateString('en-GB') : 'Select a date'}
              </Text>
            </TouchableOpacity>

            {showToDatePicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  setShowToDatePicker(false);
                  if (selectedDate) {
                    setToDate(selectedDate);
                    setIsToDateSelected(true);
                  }
                }}
              />
            )}
          </View>

          <View className="my-5">
            <Text className="text-lg">Pick up date</Text>

            <TouchableOpacity
              onPress={() => setShowPickupDatePicker(true)}
              className="border-b border-gray-200 py-3"
            >
              <Text>
                {isPickUpDateSelected ? pickupDate.toLocaleDateString('en-GB') : 'Select a date'}
              </Text>
            </TouchableOpacity>

            {showPickupDatePicker && (
              <DateTimePicker
                value={pickupDate}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  setShowPickupDatePicker(false);
                  if (selectedDate) {
                    setPickUpDate(selectedDate);
                    setIsPickUpDateSelected(true);
                  }
                }}
              />
            )}
          </View>

          <View className="my-5">
            <Text className="text-lg">Notes</Text>
            <TextInput className="border-b border-gray-200 " value={notes}
              onChangeText={setNotes} />
          </View>

          {/* Image Picker for Koi Images */}
          <View className="w-4/5 self-center mt-8">
            <Text className="font-bold text-2xl">Upload Koi Images</Text>
            <View className="flex-row flex-wrap mt-3">
              {koiImages.map((image, index) => (
                <View key={index} className="relative m-2">
                  <Image source={{ uri: image }} className="w-24 h-24 rounded-lg" />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full"
                    onPress={() => removeImage(setKoiImages, koiImages, index)}
                  >
                    <Text className="text-white font-bold">X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => pickImages(setKoiImages, koiImages)}
              className="bg-gray-200 py-3 px-4 rounded-lg items-center mt-3"
            >
              <Text className="text-gray-700">Upload More Koi Pictures</Text>
            </TouchableOpacity>
          </View>

          {/* Image Picker for Certificate Images */}
          <View className="w-4/5 self-center mt-8">
            <Text className="font-bold text-2xl">Upload Certificate Images</Text>
            <View className="flex-row flex-wrap mt-3">
              {certificateImages.map((image, index) => (
                <View key={index} className="relative m-2">
                  <Image source={{ uri: image }} className="w-24 h-24 rounded-lg" />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full"
                    onPress={() => removeImage(setCertificateImages, certificateImages, index)}
                  >
                    <Text className="text-white font-bold">X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => pickImages(setCertificateImages, certificateImages)}
              className="bg-gray-200 py-3 px-4 rounded-lg items-center mt-3"
            >
              <Text className="text-gray-700">Upload More Certificate Pictures</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="w-4/5 self-center mt-8 mb-10">
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-2xl shadow-lg items-center"
            onPress={handleSubmit}
          >
            <Text className="text-white text-lg font-semibold">Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => {
          router.push("/consignment/ConsignmentList");
        }}
        className="absolute top-6 right-3 bg-orange-400 py-3 px-4 rounded-lg items-center self-center"
      >
        <Text className="text-white text-lg font-bold">View Consignments</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default consignment;
