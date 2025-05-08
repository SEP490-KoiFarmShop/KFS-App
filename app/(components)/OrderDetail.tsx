// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Linking,
// } from "react-native";
// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Entypo from "@expo/vector-icons/Entypo";
// import AntDesign from "@expo/vector-icons/AntDesign";
// import { RadioButton } from "react-native-paper";
// import { FontAwesome } from "@expo/vector-icons";

// const paymentMethods = [
//   { id: 1, name: "Banking" },
//   { id: 2, name: "COD" },
//   { id: 3, name: "Wallet" },
// ];

// export default function OrderDetail() {
//   const { orderId, fullName, contactPhoneNumber, address } =
//     useLocalSearchParams();
//   const router = useRouter();
//   const [orderData, setOrderData] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
//     number | null
//   >(null);
//   const [balance, setBalance] = useState<any>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [customer, setCustomer] = useState<any>(null);

//   const previousAddressRef = useRef<string | null>(null);

//   const addressCalculatedRef = useRef<boolean>(false);

//   const fetchOrderDetails = useCallback(async () => {
//     try {
//       const token = await AsyncStorage.getItem("userData");

//       if (!token) {
//         Alert.alert("Error", "You need to login first!");
//         router.push("/(auth)/LoginScreen");
//         return;
//       }

//       const parsedToken = JSON.parse(token);
//       const jwtToken = parsedToken?.accessToken;

//       setIsLoading(true);

//       const formattedOrderId = Array.isArray(orderId)
//         ? orderId.join("").replace(/x/g, "&koi-fish-ids=")
//         : orderId.replace(/x/g, "&koi-fish-ids=");

//       const response = await axios.get(
//         `https://kfsapis.azurewebsites.net/api/v1/orders/check-out?koi-fish-ids=${formattedOrderId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${jwtToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       // console.log(response.data.paymentDetails["Shipping Cost"]);
//       setOrderData(response.data);
//     } catch (error: any) {
//       console.error(
//         "Error fetching order details:",
//         error.response?.data?.Message || error
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }, [orderId, router]);

//   const calculatePaymentDetailsForAddress = useCallback(
//     async (newAddress: string) => {
//       if (!orderData || !orderData.items || orderData.items.length === 0)
//         return;

//       if (
//         previousAddressRef.current === newAddress &&
//         addressCalculatedRef.current
//       ) {
//         return;
//       }

//       try {
//         const token = await AsyncStorage.getItem("userData");
//         if (!token) return;

//         const parsedToken = JSON.parse(token);
//         const jwtToken = parsedToken?.accessToken;

//         console.log("OrderID: ", orderId);

//         // Extract koi fish IDs from the order ID
//         let koiFishIdsArray: number[] = [];

//         if (typeof orderId === "string" && orderId.includes("x")) {
//           // Handle case like "85x87" - extract numbers before and after 'x'
//           const parts = orderId.split("x");
//           if (parts.length >= 2) {
//             // Add the first and second parts as separate numbers
//             koiFishIdsArray = [parseInt(parts[0], 10), parseInt(parts[1], 10)];
//           }
//         } else {
//           // Original logic for other formats
//           const formattedOrderId = Array.isArray(orderId)
//             ? orderId.join("").replace(/x/g, "")
//             : orderId.replace(/x/g, "");

//           koiFishIdsArray = formattedOrderId
//             .split("")
//             .map((id) => parseInt(id, 10));
//         }

//         const payload = {
//           address: newAddress,
//           koiFishIds: koiFishIdsArray,
//           totalAmount: orderData.paymentDetails["Total Amount"],
//           shippingCost: orderData.paymentDetails["Shipping Cost"],
//           membershipDiscount: orderData.paymentDetails["Membership Discount"],
//           accumulatePointsDiscount:
//             orderData.paymentDetails["Accumulate Points Discount"],
//           finalAmount: orderData.paymentDetails["Final Amount"],
//         };
//         console.log(payload);
//         const response = await axios.put(
//           "https://kfsapis.azurewebsites.net/api/v1/orders/payment-details/address-calculate",
//           payload,
//           {
//             headers: {
//               Authorization: `Bearer ${jwtToken}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         // console.log(response.data.data);
//         if (response.status === 200) {
//           setOrderData((prevState: any) => ({
//             ...prevState,
//             paymentDetails: response.data.data,
//           }));

//           // Update our tracking refs
//           previousAddressRef.current = newAddress;
//           addressCalculatedRef.current = true;
//         }
//       } catch (error: any) {
//         console.error(
//           "Error calculating payment details for address:",
//           error.response?.data?.Message || error
//         );
//       }
//     },
//     [orderData, orderId]
//   );

//   // Fetch wallet balance once
//   useEffect(() => {
//     const fetchBalance = async () => {
//       try {
//         const userData = await AsyncStorage.getItem("userData");
//         if (!userData) {
//           router.push("/(auth)/LoginScreen");
//           return;
//         }

//         const parsedToken = JSON.parse(userData);
//         const jwtToken = parsedToken?.accessToken;

//         const response = await axios.get(
//           `https://kfsapis.azurewebsites.net/api/Wallet/GetWalletForCustomer`,
//           {
//             headers: {
//               Authorization: `Bearer ${jwtToken}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (response.data) {
//           setBalance(response.data);
//         } else {
//           console.warn("Balance data is null.");
//           setBalance(null);
//         }
//       } catch (err) {
//         console.error("Failed to fetch balance:", err);
//       }
//     };

//     fetchBalance();
//   }, [router]);

//   // Fetch user details once
//   useEffect(() => {
//     const fetchUserDetail = async () => {
//       try {
//         const userData = await AsyncStorage.getItem("userData");
//         if (!userData) {
//           router.push("/(auth)/LoginScreen");
//           return;
//         }

//         const parsedToken = JSON.parse(userData);
//         const jwtToken = parsedToken?.accessToken;

//         const response = await axios.get(
//           `https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail`,
//           {
//             headers: {
//               Authorization: `Bearer ${jwtToken}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (response.data) {
//           setCustomer(response.data);
//           // Don't update previousAddressRef here to prevent immediate recalculation
//         }
//       } catch (err) {
//         console.error("Failed to fetch user information:", err);
//       }
//     };

//     fetchUserDetail();
//   }, [router]);

//   // Initial fetch of order details
//   useEffect(() => {
//     if (orderId) {
//       fetchOrderDetails();
//     }
//   }, [orderId, fetchOrderDetails]);

//   // Recalculate payment details only when necessary data is available and address changes
//   useEffect(() => {
//     const currentAddress = address || (customer && customer.address);

//     // Ensure we have order data and an address before calculating
//     if (orderData && currentAddress) {
//       // Only calculate if the address is different from the one we've already calculated for
//       if (
//         previousAddressRef.current !== currentAddress ||
//         !addressCalculatedRef.current
//       ) {
//         calculatePaymentDetailsForAddress(currentAddress);
//       }
//     }
//   }, [address, customer, orderData, calculatePaymentDetailsForAddress]);

//   const handleConfirmOrder = async () => {
//     if (isProcessing) {
//       return;
//     }

//     if (selectedPaymentMethod === null) {
//       Alert.alert("Error", "Please select a payment method!");
//       return;
//     }

//     try {
//       setIsProcessing(true);

//       const token = await AsyncStorage.getItem("userData");
//       if (!token) {
//         Alert.alert("Error", "You need to login first!");
//         router.push("/(auth)/LoginScreen");
//         return;
//       }

//       const parsedToken = JSON.parse(token);
//       const jwtToken = parsedToken?.accessToken;

//       const currentAddress = address || (customer && customer.address);

//       const orderPayload = {
//         fullName: fullName || (customer && customer.fullName),
//         contactPhoneNumber:
//           contactPhoneNumber || (customer && customer.phoneNumber),
//         address: currentAddress,
//         koiFishIds: orderData.items.map((item: any) => item.id),
//         paymentMethodId: selectedPaymentMethod,
//         totalAmount: orderData.paymentDetails["Total Amount"],
//         shippingCost: orderData.paymentDetails["Shipping Cost"],
//         membershipDiscount: orderData.paymentDetails["Membership Discount"],
//         accumulatePointsDiscount:
//           orderData.paymentDetails["Accumulate Points Discount"],
//         finalAmount: orderData.paymentDetails["Final Amount"],
//       };

//       const response = await axios.post(
//         "https://kfsapis.azurewebsites.net/api/v1/orders/",
//         orderPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${jwtToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.status === 200) {
//         if (response.data.order_url) {
//           Linking.openURL(response.data.order_url)
//             .then(() => {
//               router.push("(components)/order/OrderHome?orderStatus=Pending");
//             })
//             .catch(() => {
//               Alert.alert("Error", "Cannot open payment link.");
//             });
//         } else {
//           Alert.alert("Success", "Your order has been placed successfully!", [
//             {
//               text: "OK",
//               onPress: () =>
//                 router.push(`(components)/order/OrderHome?orderStatus=Pending`),
//             },
//           ]);
//         }
//       } else if (response.status === 201 || response.status === 204) {
//         router.push(`OrderSuccess?orderId=${orderId}`);
//       } else {
//         Alert.alert("(components)/order/OrderHome?orderStatus=Pending");
//       }
//     } catch (error: any) {
//       console.error("Order error:", error.response?.data?.Message || error);
//       Alert.alert(
//         "Error",
//         error.response?.data?.Message ||
//           "Failed to place order. Please try again."
//       );
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#FF6B00" />
//       </View>
//     );
//   }

//   if (!orderData) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <Text className="text-center text-gray-500">Order not found</Text>
//       </View>
//     );
//   }

//   const currentAddress = address || (customer && customer.address);
//   const currentFullName = fullName || (customer && customer.fullName);
//   const currentPhoneNumber =
//     contactPhoneNumber || (customer && customer.phoneNumber);

//   return (
//     <View className="flex-1 bg-gray-100">
//       <SafeAreaView className="flex-1">
//         {/* Go Back */}
//         <View className="flex-row items-center p-5 bg-white shadow-md">
//           <TouchableOpacity
//             onPress={() => router.push(`/Cart`)}
//             className="p-2 rounded-full bg-gray-100"
//           >
//             <Entypo name="chevron-thin-left" size={24} color="black" />
//           </TouchableOpacity>
//           <Text className="ml-4 text-2xl font-bold">Order Details</Text>
//         </View>

//         {/* Cart Items */}
//         <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
//           <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-3">
//             {customer &&
//             customer.fullName &&
//             customer.phoneNumber &&
//             customer.address ? (
//               <View>
//                 <View className="flex-row justify-between items-center mb-2">
//                   <Text className="text-lg font-semibold text-gray-800">
//                     Recipient Information
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() =>
//                       router.push({
//                         pathname: "/AddOrderInfor",
//                         params: {
//                           orderId: orderId,
//                           fullName: currentFullName,
//                           phoneNumber: currentPhoneNumber,
//                           address: currentAddress,
//                         },
//                       })
//                     }
//                     className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full"
//                   >
//                     <AntDesign name="edit" size={16} color="#FF6B00" />
//                     <Text className="ml-1 text-orange-500 font-medium">
//                       Edit
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//                 <Text className="text-gray-600 mt-1">
//                   <Text className="font-bold">Name: </Text> {currentFullName}
//                 </Text>
//                 <Text className="text-gray-600 mt-1">
//                   <Text className="font-bold">Phone: </Text>{" "}
//                   {currentPhoneNumber}
//                 </Text>
//                 <Text className="text-gray-600 mt-1">
//                   <Text className="font-bold">Address: </Text> {currentAddress}
//                 </Text>
//               </View>
//             ) : (
//               <TouchableOpacity
//                 className="flex-row items-center p-4 bg-white shadow-md rounded-lg"
//                 onPress={() => router.push(`/AddOrderInfor?orderId=${orderId}`)}
//               >
//                 <AntDesign name="pluscircleo" size={24} color="black" />
//                 <Text className="ml-3">Add Order Information</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           {orderData.items && orderData.items.length > 0 ? (
//             orderData.items.map((item: any, index: number) => (
//               <View
//                 key={index}
//                 className="flex-row items-center p-4 bg-white shadow-md rounded-lg my-2 mx-3"
//               >
//                 <Image
//                   source={
//                     item.imageUrl
//                       ? { uri: item.imageUrl }
//                       : require("../../assets/icon/defaultimage.jpg")
//                   }
//                   className="w-[70px] h-[70px] rounded-lg shadow-md"
//                   resizeMode="contain"
//                 />
//                 <View className="ml-3 flex-1">
//                   <Text className="font-bold text-lg text-gray-800">
//                     {item.name}
//                   </Text>
//                   <Text className="text-gray-600 text-sm">
//                     Quantity: {item.quantity}
//                   </Text>
//                 </View>
//                 <Text className="font-semibold text-lg text-orange-500">
//                   {item.price.toLocaleString()} VND
//                 </Text>
//               </View>
//             ))
//           ) : (
//             <Text className="text-center text-gray-500 mt-10">Cart empty</Text>
//           )}

//           <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-3 mt-4">
//             <Text className="text-lg font-semibold text-gray-800">
//               Select Payment Method
//             </Text>
//             <ScrollView
//               horizontal={true}
//               showsHorizontalScrollIndicator={false}
//               className="mt-2"
//             >
//               <View className="flex-row gap-4">
//                 {paymentMethods.map((method) => (
//                   <TouchableOpacity
//                     key={method.id}
//                     className={`flex-row items-center px-4 py-2 rounded-lg border ${
//                       selectedPaymentMethod === method.id
//                         ? "border-orange-500 bg-orange-100"
//                         : "border-gray-300"
//                     }`}
//                     onPress={() => setSelectedPaymentMethod(method.id)}
//                   >
//                     <RadioButton
//                       value={method.id.toString()}
//                       status={
//                         selectedPaymentMethod === method.id
//                           ? "checked"
//                           : "unchecked"
//                       }
//                       onPress={() => setSelectedPaymentMethod(method.id)}
//                       color="#FF6B00"
//                     />
//                     <Text className="ml-2 text-gray-700 text-lg">
//                       {method.name}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </ScrollView>
//           </View>

//           {/* Summary */}
//           <View className="mt-3 p-3 bg-gray-50 rounded-lg shadow-md mx-3">
//             <View className="flex-row justify-between">
//               <Text className="text-gray-700 text-lg">Subtotal</Text>
//               <Text className="text-gray-700 text-lg">
//                 {Math.floor(
//                   orderData.paymentDetails["Total Amount"]
//                 ).toLocaleString()}{" "}
//                 VND
//               </Text>
//             </View>
//             <View className="flex-row justify-between mt-2">
//               <Text className="text-gray-700 text-lg">Shipping Cost</Text>
//               <Text className="text-gray-700 text-lg">
//                 {Math.floor(
//                   orderData.paymentDetails["Shipping Cost"]
//                 ).toLocaleString()}{" "}
//                 VND
//               </Text>
//             </View>
//             <View className="flex-row justify-between mt-2">
//               <Text className="text-gray-700 text-lg">Membership Discount</Text>
//               <Text className="text-gray-700 text-lg">
//                 -{" "}
//                 {Math.floor(
//                   orderData.paymentDetails["Membership Discount"] || 0
//                 ).toLocaleString()}{" "}
//                 VND
//               </Text>
//             </View>
//             <View className="flex-row justify-between mt-3 border-t border-gray-300 pt-2">
//               <Text className="font-bold text-xl">Total</Text>
//               <Text className="font-bold text-xl text-orange-500">
//                 {Math.floor(
//                   orderData.paymentDetails["Final Amount"] || 0
//                 ).toLocaleString()}{" "}
//                 VND
//               </Text>
//             </View>
//           </View>

//           <View className="border-2 border-[#673ab7] rounded-xl p-4 m-4 flex-row justify-between items-center bg-white shadow-sm">
//             <View className="flex-row items-center">
//               <FontAwesome name="credit-card" size={24} color="#673ab7" />
//               <View className="ml-3">
//                 <Text className="text-xs text-gray-500">Balance</Text>
//                 <Text className="text-xl font-semibold text-black">
//                   {balance?.availableBalance?.toLocaleString() || 0} VNĐ
//                 </Text>
//               </View>
//             </View>
//             <FontAwesome name="eye" size={20} color="#673ab7" />
//           </View>
//         </ScrollView>

//         <View className="absolute bottom-0 left-0 right-0 bg-white p-5 shadow-lg">
//           <TouchableOpacity
//             onPress={handleConfirmOrder}
//             disabled={
//               isProcessing ||
//               !currentAddress ||
//               !currentFullName ||
//               !currentPhoneNumber ||
//               selectedPaymentMethod === null ||
//               (selectedPaymentMethod === 3 &&
//                 balance?.availableBalance <
//                   orderData?.paymentDetails?.["Final Amount"])
//             }
//             className={`bg-orange-500 h-14 rounded-lg shadow-md mt-2 flex items-center justify-center ${
//               isProcessing ||
//               !currentAddress ||
//               !currentFullName ||
//               !currentPhoneNumber ||
//               selectedPaymentMethod === null ||
//               (selectedPaymentMethod === 3 &&
//                 balance?.availableBalance <
//                   orderData?.paymentDetails?.["Final Amount"])
//                 ? "opacity-50"
//                 : ""
//             }`}
//           >
//             {isProcessing ? (
//               <ActivityIndicator color="white" />
//             ) : (
//               <Text className="text-white font-bold text-lg">Confirm</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { RadioButton } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";

const paymentMethods = [
  { id: 1, name: "Banking" },
  { id: 2, name: "COD" },
  { id: 3, name: "Wallet" },
];

export default function OrderDetail() {
  const { orderId, fullName, contactPhoneNumber, address } =
    useLocalSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);
  const [balance, setBalance] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customer, setCustomer] = useState<any>(null);

  // Add separate state for payment details to ensure UI updates properly
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const previousAddressRef = useRef<string | null>(null);
  const addressCalculatedRef = useRef<boolean>(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userData");

      if (!token) {
        Alert.alert("Error", "You need to login first!");
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(token);
      const jwtToken = parsedToken?.accessToken;

      setIsLoading(true);

      const formattedOrderId = Array.isArray(orderId)
        ? orderId.join("").replace(/x/g, "&koi-fish-ids=")
        : orderId.replace(/x/g, "&koi-fish-ids=");

      const response = await axios.get(
        `https://kfsapis.azurewebsites.net/api/v1/orders/check-out?koi-fish-ids=${formattedOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setOrderData(response.data);
      // Also set payment details to ensure consistency
      setPaymentDetails(response.data.paymentDetails);
      console.log("Initial payment details:", response.data.paymentDetails);
    } catch (error: any) {
      console.error(
        "Error fetching order details:",
        error.response?.data?.Message || error
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  const calculatePaymentDetailsForAddress = useCallback(
    async (newAddress: string) => {
      if (!orderData || !orderData.items || orderData.items.length === 0)
        return;

      // Skip if we've already calculated for this address
      if (
        previousAddressRef.current === newAddress &&
        addressCalculatedRef.current
      ) {
        console.log("Skipping calculation - address unchanged:", newAddress);
        return;
      }

      console.log("Calculating payment for new address:", newAddress);
      console.log("Previous address was:", previousAddressRef.current);

      try {
        const token = await AsyncStorage.getItem("userData");
        if (!token) return;

        const parsedToken = JSON.parse(token);
        const jwtToken = parsedToken?.accessToken;

        console.log("OrderID: ", orderId);

        // Extract koi fish IDs from the order ID
        let koiFishIdsArray: number[] = [];

        if (typeof orderId === "string" && orderId.includes("x")) {
          // Handle case like "85x87" - extract numbers before and after 'x'
          const parts = orderId.split("x");
          if (parts.length >= 2) {
            // Add the first and second parts as separate numbers
            koiFishIdsArray = [parseInt(parts[0], 10), parseInt(parts[1], 10)];
          }
        } else {
          // Original logic for other formats
          const formattedOrderId = Array.isArray(orderId)
            ? orderId.join("").replace(/x/g, "")
            : orderId.replace(/x/g, "");

          koiFishIdsArray = formattedOrderId
            .split("")
            .map((id) => parseInt(id, 10));
        }

        // Use the current payment details from state to ensure we're using the most up-to-date values
        const currentPaymentDetails =
          paymentDetails || orderData.paymentDetails;

        const payload = {
          address: newAddress,
          koiFishIds: koiFishIdsArray,
          totalAmount: currentPaymentDetails["Total Amount"],
          shippingCost: currentPaymentDetails["Shipping Cost"],
          membershipDiscount: currentPaymentDetails["Membership Discount"],
          accumulatePointsDiscount:
            currentPaymentDetails["Accumulate Points Discount"],
          finalAmount: currentPaymentDetails["Final Amount"],
        };

        console.log("Sending payload:", payload);

        const response = await axios.put(
          "https://kfsapis.azurewebsites.net/api/v1/orders/payment-details/address-calculate",
          payload,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API response:", response.data.data);

        if (response.status === 200) {
          // Update both state variables to ensure UI refreshes
          setOrderData((prevState: any) => {
            const newState = {
              ...prevState,
              paymentDetails: response.data.data,
            };
            return newState;
          });

          // Directly update payment details separately
          setPaymentDetails(response.data.data);
          console.log(
            "Updated shipping cost to:",
            response.data.data["Shipping Cost"]
          );

          // Update our tracking refs
          previousAddressRef.current = newAddress;
          addressCalculatedRef.current = true;
        }
      } catch (error: any) {
        console.error(
          "Error calculating payment details for address:",
          error.response?.data?.Message || error
        );
      }
    },
    [orderData, orderId, paymentDetails]
  );

  // Fetch wallet balance once
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/Wallet/GetWalletForCustomer`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setBalance(response.data);
        } else {
          console.warn("Balance data is null.");
          setBalance(null);
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };

    fetchBalance();
  }, [router]);

  // Fetch user details once
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          router.push("/(auth)/LoginScreen");
          return;
        }

        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        const response = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setCustomer(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch user information:", err);
      }
    };

    fetchUserDetail();
  }, [router]);

  // Initial fetch of order details
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  // Recalculate payment details only when necessary data is available and address changes
  useEffect(() => {
    const currentAddress = address || (customer && customer.address);

    // Ensure we have order data and an address before calculating
    if (orderData && currentAddress) {
      console.log("Current address:", currentAddress);
      console.log("Previous address ref:", previousAddressRef.current);
      console.log("Address calculated:", addressCalculatedRef.current);

      // Only calculate if the address is different from the one we've already calculated for
      if (
        previousAddressRef.current !== currentAddress ||
        !addressCalculatedRef.current
      ) {
        console.log(
          "Recalculating payment details for address:",
          currentAddress
        );
        calculatePaymentDetailsForAddress(currentAddress);
      }
    }
  }, [address, customer, orderData, calculatePaymentDetailsForAddress]);

  // Make sure payment details are in sync with orderData
  useEffect(() => {
    if (orderData && orderData.paymentDetails && !paymentDetails) {
      setPaymentDetails(orderData.paymentDetails);
    }
  }, [orderData, paymentDetails]);

  const handleConfirmOrder = async () => {
    if (isProcessing) {
      return;
    }

    if (selectedPaymentMethod === null) {
      Alert.alert("Error", "Please select a payment method!");
      return;
    }

    try {
      setIsProcessing(true);

      const token = await AsyncStorage.getItem("userData");
      if (!token) {
        Alert.alert("Error", "You need to login first!");
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(token);
      const jwtToken = parsedToken?.accessToken;

      const currentAddress = address || (customer && customer.address);

      // Use the most up-to-date payment details
      const currentPaymentDetails = paymentDetails || orderData.paymentDetails;

      const orderPayload = {
        fullName: fullName || (customer && customer.fullName),
        contactPhoneNumber:
          contactPhoneNumber || (customer && customer.phoneNumber),
        address: currentAddress,
        koiFishIds: orderData.items.map((item: any) => item.id),
        paymentMethodId: selectedPaymentMethod,
        totalAmount: currentPaymentDetails["Total Amount"],
        shippingCost: currentPaymentDetails["Shipping Cost"],
        membershipDiscount: currentPaymentDetails["Membership Discount"],
        accumulatePointsDiscount:
          currentPaymentDetails["Accumulate Points Discount"],
        finalAmount: currentPaymentDetails["Final Amount"],
      };

      const response = await axios.post(
        "https://kfsapis.azurewebsites.net/api/v1/orders/",
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        if (response.data.order_url) {
          Linking.openURL(response.data.order_url)
            .then(() => {
              router.push("(components)/order/OrderHome?orderStatus=Pending");
            })
            .catch(() => {
              Alert.alert("Error", "Cannot open payment link.");
            });
        } else {
          Alert.alert("Success", "Your order has been placed successfully!", [
            {
              text: "OK",
              onPress: () =>
                router.push(`(components)/order/OrderHome?orderStatus=Pending`),
            },
          ]);
        }
      } else if (response.status === 201 || response.status === 204) {
        router.push(`OrderSuccess?orderId=${orderId}`);
      } else {
        Alert.alert("(components)/order/OrderHome?orderStatus=Pending");
      }
    } catch (error: any) {
      console.error("Order error:", error.response?.data?.Message || error);
      Alert.alert(
        "Error",
        error.response?.data?.Message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!orderData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center text-gray-500">Order not found</Text>
      </View>
    );
  }

  const currentAddress = address || (customer && customer.address);
  const currentFullName = fullName || (customer && customer.fullName);
  const currentPhoneNumber =
    contactPhoneNumber || (customer && customer.phoneNumber);

  // Use the most up-to-date payment details for display
  const currentPaymentDetails = paymentDetails || orderData.paymentDetails;

  return (
    <View className="flex-1 bg-gray-100">
      <SafeAreaView className="flex-1">
        {/* Go Back */}
        <View className="flex-row items-center p-5 bg-white shadow-md">
          <TouchableOpacity
            onPress={() => router.push(`/Cart`)}
            className="p-2 rounded-full bg-gray-100"
          >
            <Entypo name="chevron-thin-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-4 text-2xl font-bold">Order Details</Text>
        </View>

        {/* Cart Items */}
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-3">
            {customer &&
            customer.fullName &&
            customer.phoneNumber &&
            customer.address ? (
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-800">
                    Recipient Information
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/AddOrderInfor",
                        params: {
                          orderId: orderId,
                          fullName: currentFullName,
                          phoneNumber: currentPhoneNumber,
                          address: currentAddress,
                        },
                      })
                    }
                    className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <AntDesign name="edit" size={16} color="#FF6B00" />
                    <Text className="ml-1 text-orange-500 font-medium">
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-gray-600 mt-1">
                  <Text className="font-bold">Name: </Text> {currentFullName}
                </Text>
                <Text className="text-gray-600 mt-1">
                  <Text className="font-bold">Phone: </Text>{" "}
                  {currentPhoneNumber}
                </Text>
                <Text className="text-gray-600 mt-1">
                  <Text className="font-bold">Address: </Text> {currentAddress}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-row items-center p-4 bg-white shadow-md rounded-lg"
                onPress={() => router.push(`/AddOrderInfor?orderId=${orderId}`)}
              >
                <AntDesign name="pluscircleo" size={24} color="black" />
                <Text className="ml-3">Add Order Information</Text>
              </TouchableOpacity>
            )}
          </View>

          {orderData.items && orderData.items.length > 0 ? (
            orderData.items.map((item: any, index: number) => (
              <View
                key={index}
                className="flex-row items-center p-4 bg-white shadow-md rounded-lg my-2 mx-3"
              >
                <Image
                  source={
                    item.imageUrl
                      ? { uri: item.imageUrl }
                      : require("../../assets/icon/defaultimage.jpg")
                  }
                  className="w-[70px] h-[70px] rounded-lg shadow-md"
                  resizeMode="contain"
                />
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-lg text-gray-800">
                    {item.name}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Quantity: {item.quantity}
                  </Text>
                </View>
                <Text className="font-semibold text-lg text-orange-500">
                  {item.price.toLocaleString()} VND
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-500 mt-10">Cart empty</Text>
          )}

          <View className="p-4 bg-white shadow-md rounded-lg my-2 mx-3 mt-4">
            <Text className="text-lg font-semibold text-gray-800">
              Select Payment Method
            </Text>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              className="mt-2"
            >
              <View className="flex-row gap-4">
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    className={`flex-row items-center px-4 py-2 rounded-lg border ${
                      selectedPaymentMethod === method.id
                        ? "border-orange-500 bg-orange-100"
                        : "border-gray-300"
                    }`}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <RadioButton
                      value={method.id.toString()}
                      status={
                        selectedPaymentMethod === method.id
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() => setSelectedPaymentMethod(method.id)}
                      color="#FF6B00"
                    />
                    <Text className="ml-2 text-gray-700 text-lg">
                      {method.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Summary */}
          <View className="mt-3 p-3 bg-gray-50 rounded-lg shadow-md mx-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-700 text-lg">Subtotal</Text>
              <Text className="text-gray-700 text-lg">
                {Math.floor(
                  currentPaymentDetails["Total Amount"]
                ).toLocaleString()}{" "}
                VND
              </Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-700 text-lg">Shipping Cost</Text>
              <Text className="text-gray-700 text-lg">
                {Math.floor(
                  currentPaymentDetails["Shipping Cost"]
                ).toLocaleString()}{" "}
                VND
              </Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-700 text-lg">Membership Discount</Text>
              <Text className="text-gray-700 text-lg">
                -{" "}
                {Math.floor(
                  currentPaymentDetails["Membership Discount"] || 0
                ).toLocaleString()}{" "}
                VND
              </Text>
            </View>
            <View className="flex-row justify-between mt-3 border-t border-gray-300 pt-2">
              <Text className="font-bold text-xl">Total</Text>
              <Text className="font-bold text-xl text-orange-500">
                {Math.floor(
                  currentPaymentDetails["Final Amount"] || 0
                ).toLocaleString()}{" "}
                VND
              </Text>
            </View>
          </View>

          <View className="border-2 border-[#673ab7] rounded-xl p-4 m-4 flex-row justify-between items-center bg-white shadow-sm">
            <View className="flex-row items-center">
              <FontAwesome name="credit-card" size={24} color="#673ab7" />
              <View className="ml-3">
                <Text className="text-xs text-gray-500">Balance</Text>
                <Text className="text-xl font-semibold text-black">
                  {balance?.availableBalance?.toLocaleString() || 0} VNĐ
                </Text>
              </View>
            </View>
            <FontAwesome name="eye" size={20} color="#673ab7" />
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-white p-5 shadow-lg">
          <TouchableOpacity
            onPress={handleConfirmOrder}
            disabled={
              isProcessing ||
              !currentAddress ||
              !currentFullName ||
              !currentPhoneNumber ||
              selectedPaymentMethod === null ||
              (selectedPaymentMethod === 3 &&
                balance?.availableBalance <
                  currentPaymentDetails?.["Final Amount"])
            }
            className={`bg-orange-500 h-14 rounded-lg shadow-md mt-2 flex items-center justify-center ${
              isProcessing ||
              !currentAddress ||
              !currentFullName ||
              !currentPhoneNumber ||
              selectedPaymentMethod === null ||
              (selectedPaymentMethod === 3 &&
                balance?.availableBalance <
                  currentPaymentDetails?.["Final Amount"])
                ? "opacity-50"
                : ""
            }`}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
