// import {
//   View,
//   Text,
//   Image,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   Dimensions,
//   Modal,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import GlobalApi from "@/utils/GlobalApi";
// import CustomButton from "@/components/CustomButton";
// import { ActivityIndicator, MD2Colors } from "react-native-paper";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Toast from "react-native-toast-message";

// interface Koi {
//   id: string;
//   name: string;
//   sex: string;
//   description: string;
//   size: string;
//   price: number;
//   breeder: string;
//   bornDate: string;
//   image: { url: string }[];
//   category: { name: string };
//   varieties: string;
//   status: string;
//   isConsignedByAccountId: string;
//   isYourConsignedFish: boolean;
//   isInConsignment: boolean;
//   certificateImage: { url: string }[];
//   isConsignedBy: string;
//   isAddableToCart: boolean;
// }

// export default function KoiDetailScreen() {
//   const router = useRouter();
//   const { id } = useLocalSearchParams();
//   const [koisById, setKoisById] = useState<Koi | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   // State for image zoom modal
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);

//   const windowWidth = Dimensions.get("window").width;
//   const windowHeight = Dimensions.get("window").height;

//   const goToCart = () => {
//     Toast.show({
//       type: "info",
//       text1: "Notification",
//       text2: "This product is already in your cart",
//       position: "top",
//     });
//   };

//   const submit = async () => {
//     try {
//       const token = await AsyncStorage.getItem("userData");

//       if (!token) {
//         Alert.alert("Error", "You need to login first!");
//         router.push("/(auth)/LoginScreen");
//         return;
//       }

//       const parsedToken = JSON.parse(token);
//       const jwtToken = parsedToken?.accessToken;

//       const response = await axios.post(
//         "https://kfsapis.azurewebsites.net/api/v1/carts/product",
//         {
//           koiFishId: koisById?.id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${jwtToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       if (response.status === 201) {
//         Alert.alert("Success", "Koi fish added to cart!");
//         //router.push(`/Cart`);
//       }
//     } catch (error: any) {
//       console.error("Error adding koi to cart:", error);
//       Alert.alert("Error", "Failed to add koi to cart.");
//     }
//   };

//   useEffect(() => {
//     const getUserId = async () => {
//       const token = await AsyncStorage.getItem("userData");
//       if (token) {
//         const parsedToken = JSON.parse(token);
//         setCurrentUserId(parsedToken?.id);
//       }
//     };

//     getUserId();
//   }, []);

//   useEffect(() => {
//     const fetchKoiDetail = async () => {
//       try {
//         const apiData = await GlobalApi.getKoisById(id);
//         if (!apiData || Object.keys(apiData).length === 0) {
//           setKoisById(null);
//           return;
//         }
//         const imageUrls = Array.isArray(apiData.imageUrl)
//           ? apiData.imageUrl.map((url: string) => ({ url }))
//           : [{ url: require("../../assets/icon/defaultimage.jpg") }];

//         const certificateImageUrls = Array.isArray(apiData.certificateImageUrl)
//           ? apiData.certificateImageUrl.map((url: string) => ({ url }))
//           : [];

//         const formattedKoi: Koi = {
//           id: apiData.id?.toString() || "",
//           name: apiData.name || "Unknown",
//           sex: apiData.gender || "Unknown",
//           description: apiData.description || "No description available",
//           size: apiData.size || "Unknown",
//           price: apiData.price || 0,
//           breeder: apiData.breeders || "Unknown",
//           image: imageUrls,
//           category: { name: apiData.type || "Unknown" },
//           bornDate: apiData.bornDate || "Unknown",
//           varieties: apiData.varieties || "Unknown",
//           status: apiData.status || "Unknown",
//           certificateImage: certificateImageUrls,
//           isConsignedByAccountId: apiData.isConsignedByAccountId || "Unknown",
//           isYourConsignedFish: apiData.isYourConsignedFish || false,
//           isInConsignment: apiData.isInConsignment || false,
//           isConsignedBy: apiData.isConsignedBy || "Unknown",
//           isAddableToCart: apiData.isAddableToCart,
//         };

//         setKoisById(formattedKoi);
//       } catch (error) {
//         console.error("Error fetching koi details:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchKoiDetail();
//   }, [id]);

//   const handleImagePress = (imageUrl: string) => {
//     setSelectedImage(imageUrl);
//     setModalVisible(true);
//   };

//   if (isLoading) {
//     return (
//       <View className="justify-center items-center flex-1">
//         <ActivityIndicator animating={true} color={MD2Colors.red800} />
//       </View>
//     );
//   }

//   if (!koisById) {
//     return (
//       <View className="justify-center items-center flex-1">
//         <Text className="text-gray-500">No data available</Text>
//       </View>
//     );
//   }

//   const formatPrice = (price: number) => {
//     return price.toLocaleString("vi-VN");
//   };

//   const formatDate = (dateString: string | null | undefined) => {
//     if (!dateString) return "Unknown";

//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "Invalid date";
//     return date.toLocaleDateString("vi-VN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   return (
//     <View className="flex-1">
//       {/* Image Zoom Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View className="flex-1 bg-black/80 justify-center items-center">
//           <TouchableOpacity
//             className="absolute top-10 right-5 z-10 p-2 bg-black/50 rounded-full"
//             onPress={() => setModalVisible(false)}
//           >
//             <Text className="text-white font-bold text-lg">X</Text>
//           </TouchableOpacity>

//           {selectedImage && (
//             <Image
//               source={
//                 typeof selectedImage === "string"
//                   ? { uri: selectedImage }
//                   : selectedImage
//               }
//               style={{ width: windowWidth * 0.9, height: windowHeight * 0.7 }}
//               resizeMode="contain"
//             />
//           )}
//         </View>
//       </Modal>

//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 100 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="flex-row">
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             className="ml-5"
//           >
//             {(koisById.image.length > 0
//               ? koisById.image
//               : [{ url: require("../../assets/icon/defaultimage.jpg") }]
//             ).map((img, index) => (
//               <TouchableOpacity
//                 key={index}
//                 onPress={() =>
//                   handleImagePress(
//                     typeof img.url === "string"
//                       ? img.url
//                       : require("../../assets/icon/defaultimage.jpg")
//                   )
//                 }
//                 activeOpacity={0.8}
//                 className="mr-5 mt-5"
//               >
//                 <Image
//                   className="w-[250px] h-[300px]"
//                   source={
//                     typeof img.url === "string" ? { uri: img.url } : img.url
//                   }
//                   resizeMode="contain"
//                 />
//                 {/* <View className="absolute bottom-0 right-0 bg-black/30 px-2 py-1 rounded-tl-md">
//                   <Text className="text-white text-xs">Zoom in</Text>
//                 </View> */}
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//         <View className="m-5">
//           <Text className="font-bold text-2xl text-black ml-2">
//             {koisById.name}
//           </Text>
//           <Text className="font-semibold text-orange-600 mt-3 text-xl ml-5">
//             {formatPrice(koisById.price)} VNĐ
//           </Text>
//           {/* <Text className="text-gray-500 mt-5">- {koisById.description}</Text> */}
//           <Text className="font-semibold text-xl mt-5">
//             Detail Information of {koisById.name} :
//           </Text>
//           <View className="mt-3 mb-3">
//             <Text className="text-gray-700 text-lg">
//               💰 Type sell: {koisById.category.name}
//             </Text>
//             <Text className="text-gray-700 text-lg">
//               ♂️ Gender: {koisById.sex}
//             </Text>
//             <Text className="text-gray-700 text-lg">
//               📏 Size: {koisById.size} cm
//             </Text>
//             <Text className="text-gray-700 text-lg">
//               📅 Born Date: {formatDate(koisById.bornDate)}
//             </Text>
//             <Text className="text-gray-700 text-lg">
//               ✅ Status:{" "}
//               <Text className="text-green-500 text-lg font-bold">
//                 {koisById.status}
//               </Text>
//             </Text>
//             <Text className="text-gray-700 text-lg">
//               🎨 Varieties: {koisById.varieties}
//             </Text>

//             {koisById.isInConsignment && (
//               <View className=" p-1 bg-gray-100 rounded-md">
//                 <Text className="text-gray-700 text-lg font-semibold mb-1">
//                   📋 Consignment Information:
//                 </Text>
//                 <Text className="text-gray-700 text-lg">
//                   🆔 Consigned By: {koisById.isConsignedBy}
//                 </Text>
//               </View>
//             )}
//           </View>

//           <Text className="font-black text-xl mt-2">Source:</Text>
//           <TouchableOpacity
//             onPress={() =>
//               router.push(`/KoiByBreeder?breeder=${koisById.breeder}`)
//             }
//           >
//             <Text className="text-blue-600 text-xl mt-1 font-medium">
//               {koisById.breeder}
//             </Text>
//           </TouchableOpacity>

//           {koisById.certificateImage &&
//             koisById.certificateImage.length > 0 && (
//               <View className="mt-10">
//                 <Text className="font-black text-xl mb-2">
//                   Certificate Images:
//                 </Text>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   {koisById.certificateImage.map((cert, index) => (
//                     <TouchableOpacity
//                       key={index}
//                       className="mr-3"
//                       onPress={() => handleImagePress(cert.url)}
//                       activeOpacity={0.8}
//                     >
//                       <Image
//                         className="w-[200px] h-[250px] rounded-md"
//                         source={{ uri: cert.url }}
//                         resizeMode="contain"
//                       />
//                       {/* <View className="absolute bottom-0 right-0 bg-black/30 px-2 py-1 rounded-tl-md">
//                         <Text className="text-white text-xs">
//                           Nhấn để phóng to
//                         </Text>
//                       </View> */}
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               </View>
//             )}
//         </View>
//       </ScrollView>

//       {(!koisById.isInConsignment ||
//         (koisById.isInConsignment &&
//           koisById.isConsignedByAccountId !== currentUserId)) && (
//         <View>
//           {koisById.isAddableToCart ? (
//             <CustomButton
//               title="Add To Cart"
//               handlePress={submit}
//               containerStyles="mt-10 mb-5 bg-orange-500 h-14 mr-5 ml-5"
//               isLoading={false}
//             />
//           ) : (
//             <TouchableOpacity
//               onPress={goToCart}
//               className="mt-10 mb-5 bg-gray-500 h-14 mr-5 ml-5 rounded-md justify-center items-center"
//             >
//               <Text className="text-white font-bold text-lg">
//                 This Product Is In Your Cart
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}

//       {koisById.isInConsignment &&
//         koisById.isConsignedByAccountId === currentUserId && (
//           <View>
//             <Text className="text-xs font-semibold text-red-500 text-center mb-5 mt-3">
//               You can't buy the products that you consign
//             </Text>
//           </View>
//         )}
//     </View>
//   );
// }

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import GlobalApi from "@/utils/GlobalApi";
import CustomButton from "@/components/CustomButton";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

interface Koi {
  id: string;
  name: string;
  sex: string;
  description: string;
  size: string;
  price: number;
  breeder: string;
  bornDate: string;
  image: { url: string }[];
  category: { name: string };
  varieties: string;
  status: string;
  isConsignedByAccountId: string;
  isYourConsignedFish: boolean;
  isInConsignment: boolean;
  certificateImage: { url: string }[];
  isConsignedBy: string;
  isAddableToCart: boolean;
}

export default function KoiDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [koisById, setKoisById] = useState<Koi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // State for image zoom modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  const goToCart = () => {
    Toast.show({
      type: "info",
      text1: "Notification",
      text2: "This product is already in your cart",
      position: "top",
    });
  };

  // Function to fetch koi details - extracted to be reusable
  const fetchKoiDetail = async () => {
    try {
      setIsLoading(true);
      const apiData = await GlobalApi.getKoisById(id);
      if (!apiData || Object.keys(apiData).length === 0) {
        setKoisById(null);
        return;
      }
      const imageUrls = Array.isArray(apiData.imageUrl)
        ? apiData.imageUrl.map((url: string) => ({ url }))
        : [{ url: require("../../assets/icon/defaultimage.jpg") }];

      const certificateImageUrls = Array.isArray(apiData.certificateImageUrl)
        ? apiData.certificateImageUrl.map((url: string) => ({ url }))
        : [];

      const formattedKoi: Koi = {
        id: apiData.id?.toString() || "",
        name: apiData.name || "Unknown",
        sex: apiData.gender || "Unknown",
        description: apiData.description || "No description available",
        size: apiData.size || "Unknown",
        price: apiData.price || 0,
        breeder: apiData.breeders || "Unknown",
        image: imageUrls,
        category: { name: apiData.type || "Unknown" },
        bornDate: apiData.bornDate || "Unknown",
        varieties: apiData.varieties || "Unknown",
        status: apiData.status || "Unknown",
        certificateImage: certificateImageUrls,
        isConsignedByAccountId: apiData.isConsignedByAccountId || "Unknown",
        isYourConsignedFish: apiData.isYourConsignedFish || false,
        isInConsignment: apiData.isInConsignment || false,
        isConsignedBy: apiData.isConsignedBy || "Unknown",
        isAddableToCart: apiData.isAddableToCart,
      };

      setKoisById(formattedKoi);
    } catch (error) {
      console.error("Error fetching koi details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submit = async () => {
    try {
      const token = await AsyncStorage.getItem("userData");

      if (!token) {
        Alert.alert("Error", "You need to login first!");
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(token);
      const jwtToken = parsedToken?.accessToken;

      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/carts/product",
        {
          koiFishId: koisById?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 201) {
        Alert.alert("Success", "Koi fish added to cart!");
        // Reload koi details to get updated isAddableToCart status
        fetchKoiDetail();
      }
    } catch (error: any) {
      console.error("Error adding koi to cart:", error);
      Alert.alert("Error", "Failed to add koi to cart.");
    }
  };

  useEffect(() => {
    const getUserId = async () => {
      const token = await AsyncStorage.getItem("userData");
      if (token) {
        const parsedToken = JSON.parse(token);
        setCurrentUserId(parsedToken?.id);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    fetchKoiDetail();
  }, [id]);

  // Function to handle image press - opens modal with selected image
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  if (isLoading) {
    return (
      <View className="justify-center items-center flex-1">
        <ActivityIndicator animating={true} color={MD2Colors.red800} />
      </View>
    );
  }

  if (!koisById) {
    return (
      <View className="justify-center items-center flex-1">
        <Text className="text-gray-500">No data available</Text>
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1">
      {/* Image Zoom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center">
          <TouchableOpacity
            className="absolute top-10 right-5 z-10 p-2 bg-black/50 rounded-full"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-white font-bold text-lg">X</Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={
                typeof selectedImage === "string"
                  ? { uri: selectedImage }
                  : selectedImage
              }
              style={{ width: windowWidth * 0.9, height: windowHeight * 0.7 }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="ml-5"
          >
            {(koisById.image.length > 0
              ? koisById.image
              : [{ url: require("../../assets/icon/defaultimage.jpg") }]
            ).map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  handleImagePress(
                    typeof img.url === "string"
                      ? img.url
                      : require("../../assets/icon/defaultimage.jpg")
                  )
                }
                activeOpacity={0.8}
                className="mr-5 mt-5"
              >
                <Image
                  className="w-[250px] h-[300px]"
                  source={
                    typeof img.url === "string" ? { uri: img.url } : img.url
                  }
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View className="m-5">
          <Text className="font-bold text-2xl text-black ml-2">
            {koisById.name}
          </Text>
          <Text className="font-semibold text-orange-600 mt-3 text-xl ml-5">
            {formatPrice(koisById.price)} VNĐ
          </Text>
          <Text className="font-semibold text-xl mt-5">
            Detail Information of {koisById.name} :
          </Text>
          <View className="mt-3 mb-3">
            <Text className="text-gray-700 text-lg">
              💰 Type sell: {koisById.category.name}
            </Text>
            <Text className="text-gray-700 text-lg">
              ♂️ Gender: {koisById.sex}
            </Text>
            <Text className="text-gray-700 text-lg">
              📏 Size: {koisById.size} cm
            </Text>
            <Text className="text-gray-700 text-lg">
              📅 Born Date: {formatDate(koisById.bornDate)}
            </Text>
            <Text className="text-gray-700 text-lg">
              ✅ Status:{" "}
              <Text className="text-green-500 text-lg font-bold">
                {koisById.status}
              </Text>
            </Text>
            <Text className="text-gray-700 text-lg">
              🎨 Varieties: {koisById.varieties}
            </Text>

            {koisById.isInConsignment && (
              <View className=" p-1 bg-gray-100 rounded-md">
                <Text className="text-gray-700 text-lg font-semibold mb-1">
                  📋 Consignment Information:
                </Text>
                <Text className="text-gray-700 text-lg">
                  🆔 Consigned By: {koisById.isConsignedBy}
                </Text>
              </View>
            )}
          </View>

          <Text className="font-black text-xl mt-2">Source:</Text>
          <TouchableOpacity
            onPress={() =>
              router.push(`/KoiByBreeder?breeder=${koisById.breeder}`)
            }
          >
            <Text className="text-blue-600 text-xl mt-1 font-medium">
              {koisById.breeder}
            </Text>
          </TouchableOpacity>

          {koisById.certificateImage &&
            koisById.certificateImage.length > 0 && (
              <View className="mt-10">
                <Text className="font-black text-xl mb-2">
                  Certificate Images:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {koisById.certificateImage.map((cert, index) => (
                    <TouchableOpacity
                      key={index}
                      className="mr-3"
                      onPress={() => handleImagePress(cert.url)}
                      activeOpacity={0.8}
                    >
                      <Image
                        className="w-[200px] h-[250px] rounded-md"
                        source={{ uri: cert.url }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
        </View>
      </ScrollView>

      {(!koisById.isInConsignment ||
        (koisById.isInConsignment &&
          koisById.isConsignedByAccountId !== currentUserId)) && (
        <View>
          {koisById.isAddableToCart ? (
            <CustomButton
              title="Add To Cart"
              handlePress={submit}
              containerStyles="mt-10 mb-5 bg-orange-500 h-14 mr-5 ml-5"
              isLoading={false}
            />
          ) : (
            <TouchableOpacity
              onPress={goToCart}
              className="mt-10 mb-5 bg-gray-500 h-14 mr-5 ml-5 rounded-md justify-center items-center"
            >
              <Text className="text-white font-bold text-lg">
                This Product Is In Your Cart
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {koisById.isInConsignment &&
        koisById.isConsignedByAccountId === currentUserId && (
          <View>
            <Text className="text-xs font-semibold text-red-500 text-center mb-5 mt-3">
              You can't buy the products that you consign
            </Text>
          </View>
        )}
    </View>
  );
}
