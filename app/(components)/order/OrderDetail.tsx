// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Alert,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import Entypo from "@expo/vector-icons/Entypo";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import { ActivityIndicator } from "react-native-paper";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function OrderDetail() {
//   const router = useRouter();
//   const { orderId } = useLocalSearchParams();
//   const [order, setOrder] = useState<any>(null);
//   const [orderTrackings, setOrderTrackings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [cancelLoading, setCancelLoading] = useState(false);

//   useEffect(() => {
//     const fetchOrderDetails = async () => {
//       try {
//         const userData = await AsyncStorage.getItem("userData");
//         if (!userData) {
//           router.push("/(auth)/LoginScreen");
//           return;
//         }

//         const parsedToken = JSON.parse(userData);
//         const jwtToken = parsedToken?.accessToken;

//         // Fetch order details
//         const orderResponse = await axios.get(
//           `https://kfsapis.azurewebsites.net/api/v1/orders/${orderId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${jwtToken}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         console.log(orderResponse.data.data);
//         setOrder(orderResponse.data.data);

//         // Fetch order tracking data
//         const trackingResponse = await axios.get(
//           `https://kfsapis.azurewebsites.net/api/v1/orders/${orderId}/order-trackings`,
//           {
//             headers: {
//               Authorization: `Bearer ${jwtToken}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         // Sort trackings by creation date (newest first)
//         const sortedTrackings = trackingResponse.data.data.sort(
//           (a: any, b: any) =>
//             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//         );
//         setOrderTrackings(sortedTrackings);
//       } catch (error: any) {
//         console.error("Error fetching order details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrderDetails();
//   }, []);

//   // Format date to display in a more readable format
//   const formatDate = (dateString: any) => {
//     const date = new Date(dateString);
//     return (
//       date.toLocaleDateString("vi-VN", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//       }) +
//       " " +
//       date.toLocaleTimeString("vi-VN", {
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//     );
//   };

//   // Get status color based on current status
//   const getStatusColor = (status: any) => {
//     switch (status) {
//       case "Finished":
//         return "bg-green-100 text-green-600";
//       case "PendingPayment":
//         return "bg-yellow-100 text-yellow-600";
//       case "Pending":
//         return "bg-blue-100 text-blue-600";
//       default:
//         return "bg-gray-100 text-gray-600";
//     }
//   };

//   const handleCancel = async () => {
//     Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
//       {
//         text: "No",
//         style: "cancel",
//       },
//       {
//         text: "Yes",
//         onPress: async () => {
//           try {
//             setCancelLoading(true);
//             const userData = await AsyncStorage.getItem("userData");
//             if (!userData) {
//               return;
//             }

//             const parsedToken = JSON.parse(userData);
//             const jwtToken = parsedToken?.accessToken;

//             await axios.put(
//               `https://kfsapis.azurewebsites.net/api/v1/orders/cancelled/${orderId}`,
//               {},
//               {
//                 headers: {
//                   Authorization: `Bearer ${jwtToken}`,
//                   "Content-Type": "application/json",
//                 },
//               }
//             );

//             // Refresh order details after cancellation
//             const orderResponse = await axios.get(
//               `https://kfsapis.azurewebsites.net/api/v1/orders/${orderId}`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${jwtToken}`,
//                   "Content-Type": "application/json",
//                 },
//               }
//             );
//             setOrder(orderResponse.data.data);

//             // Refresh tracking information
//             const trackingResponse = await axios.get(
//               `https://kfsapis.azurewebsites.net/api/v1/orders/${orderId}/order-trackings`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${jwtToken}`,
//                   "Content-Type": "application/json",
//                 },
//               }
//             );
//             const sortedTrackings = trackingResponse.data.data.sort(
//               (a: any, b: any) =>
//                 new Date(b.createdAt).getTime() -
//                 new Date(a.createdAt).getTime()
//             );
//             setOrderTrackings(sortedTrackings);

//             Alert.alert("Success", "Order has been cancelled successfully");
//           } catch (error: any) {
//             console.error(
//               "Error cancelling order:",
//               error.response.data.Messageror
//             );
//             Alert.alert(
//               "Error",
//               error.response.data.Message || "Failed to cancel order"
//             );
//           } finally {
//             setCancelLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   const canCancelOrder = () => {
//     return order && ["Pending", "PendingPayment"].includes(order.status);
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#ff0000" />
//       </View>
//     );
//   }

//   if (!order) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <Text className="text-gray-700">Không có dữ liệu đơn hàng</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView className="flex-1">
//       <View className="w-full mb-2 flex-row items-center space-x-4 bg-white pb-3 pt-4">
//         <TouchableOpacity
//           onPress={() => router.push(`/(components)/order/OrderHome`)}
//           className="p-2 rounded-full bg-gray-200 ml-2"
//         >
//           <Entypo name="chevron-thin-left" size={24} color="black" />
//         </TouchableOpacity>
//         <View className="ml-4">
//           <Text className="font-bold text-3xl text-gray-900">Order Detail</Text>
//           <Text className="font-light text-gray-500">
//             Used for shipping orders
//           </Text>
//         </View>
//       </View>

//       <View className="bg-white m-3">
//         <View className="bg-green-100 p-4 rounded-lg mb-4">
//           <Text className="text-green-600 font-bold">{order.status}</Text>
//         </View>

//         <View className="mt-3 ml-5 mb-3">
//           <Text className="text-gray-700 font-semibold">
//             Delivery Information
//           </Text>
//           <Text className="text-gray-600">{order.shippingAddress}</Text>
//           <View className="flex-row mt-2">
//             <MaterialCommunityIcons
//               className="mt-3"
//               name="truck-fast-outline"
//               size={24}
//               color="black"
//             />
//             <View>
//               <Text className="mt-2 ml-3 text-green-600">
//                 {order.latestOrderTracking?.description || "Đang xử lý"}
//               </Text>
//               <Text className="text-gray-600 ml-3">
//                 {new Date(order.createdAt).toLocaleString()}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Cancel Order Button */}
//         {canCancelOrder() && (
//           <View className="mx-5 mb-4">
//             <TouchableOpacity
//               onPress={handleCancel}
//               disabled={cancelLoading}
//               className="bg-red-500 py-3 px-4 rounded-lg items-center"
//             >
//               {cancelLoading ? (
//                 <ActivityIndicator size="small" color="#ffffff" />
//               ) : (
//                 <Text className="text-white font-bold">Cancel Order</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Order Tracking Timeline */}
//         <View className="mx-5 my-3">
//           <Text className="text-gray-700 font-semibold text-lg mb-3">
//             Order Tracking
//           </Text>
//           {orderTrackings.map((tracking, index) => (
//             <View key={index} className="flex-row mb-4">
//               {/* Timeline line */}
//               <View className="items-center mr-4">
//                 <View
//                   className={`w-4 h-4 rounded-full ${
//                     index === 0 ? "bg-green-500" : "bg-gray-300"
//                   }`}
//                 />
//                 {index !== orderTrackings.length - 1 && (
//                   <View className="w-0.5 h-16 bg-gray-300" />
//                 )}
//               </View>

//               {/* Tracking details */}
//               <View className="flex-1">
//                 <View
//                   className={`px-3 py-1 rounded-full self-start ${
//                     getStatusColor(tracking.currentStatus).split(" ")[0]
//                   }`}
//                 >
//                   <Text
//                     className={
//                       getStatusColor(tracking.currentStatus).split(" ")[1]
//                     }
//                   >
//                     {tracking.currentStatus}
//                   </Text>
//                 </View>
//                 <Text className="text-gray-800 font-medium mt-1">
//                   {tracking.description}
//                 </Text>
//                 <Text className="text-gray-500 text-sm">
//                   {formatDate(tracking.createdAt)}
//                 </Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         <View className="border-b border-gray-300 my-4" />

//         <View className="mb-4 mt-4 ml-5">
//           <Text className="text-gray-700 font-semibold">Address Customer</Text>
//           <View className="flex-row">
//             <Text className="text-black text-xl">{order.receiverName} -</Text>
//             <Text className="mt-1 text-gray-500 ml-2">
//               {order.contactPhoneNumber}
//             </Text>
//           </View>
//           <Text className="text-gray-700">
//             Address: {order.shippingAddress}
//           </Text>
//         </View>
//       </View>

//       {order.orderDetails.map((item: any, index: any) => (
//         <View key={index} className="bg-white p-4 rounded-lg m-3">
//           <View className="flex-row mt-2">
//             <Image
//               source={{ uri: item.productImageUrl }}
//               className="w-20 h-20 rounded-md"
//             />
//             <View className="ml-4 flex-1">
//               <Text className="text-gray-800 text-xl font-semibold">
//                 {item.productName}
//               </Text>
//               <Text className="text-gray-600 self-end">x{item.quantity}</Text>
//               <Text className="text-black font-bold mt-4 self-end">
//                 {item.unitPrice.toLocaleString()} VNĐ
//               </Text>
//             </View>
//           </View>
//           <View className="border-b border-gray-300 my-4" />
//           <View className="self-end mt-2">
//             <Text className="text-red-500 font-bold">
//               Total Amount: {(item.unitPrice * item.quantity).toLocaleString()}{" "}
//               VNĐ
//             </Text>
//           </View>
//         </View>
//       ))}
//       <View className="bg-white p-4 rounded-lg mb-3 ml-3 mr-3 mt-1 justify-between">
//         <Text className="font-semibold text-orange-500 text-xl mb-2">
//           Order Information
//         </Text>
//         <View className="mt-2 flex-row">
//           <Text className="text-gray-700 font-semibold flex-1">
//             Payment Method
//           </Text>
//           <Text className="text-orange-600 text-right">
//             {order.paymentMethodName}
//           </Text>
//         </View>
//         <View className="mt-2 flex-row">
//           <Text className="text-gray-700 font-semibold flex-1">
//             Status Order
//           </Text>
//           <Text className="text-gray-600 text-right">{order.status}</Text>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ActivityIndicator } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define Order interface based on the full order data structure
interface OrderDetail {
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface OrderTracking {
  id: number;
  currentStatus: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  customerId: number;
  totalAmount: number;
  shippingCost: number;
  finalAmount: number;
  contactPhoneNumber: string;
  receiverName: string;
  shippingAddress: string;
  notes: string | null;
  status: string;
  isPaid: boolean;
  paymentAt: string | null;
  paymentMethodId: number;
  paymentMethodName: string;
  isDeliveredByShipper: boolean;
  shipperId: number | null;
  assignedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  isAccumulatePointsExchanged: boolean;
  accumulatePointsDiscount: number;
  isMembershipApplied: boolean;
  membershipDiscount: number;
  cancelledReason: string | null;
  orderDetails: OrderDetail[];
  latestOrderTracking: OrderTracking;
  orderTrackings?: OrderTracking[];
  refundDetail: any | null;
}

export default function OrderDetail() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderTrackings, setOrderTrackings] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchOrderData();
  }, []);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }

      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      // Fetch complete order details
      const orderResponse = await axios.get(
        `https://kfsapis.azurewebsites.net/api/v1/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setOrder(orderResponse.data.data);
      console.log("Order data:", orderResponse.data.data);

      // Check if orderTrackings is already included in the order data
      if (
        orderResponse.data.data.orderTrackings &&
        orderResponse.data.data.orderTrackings.length > 0
      ) {
        // Sort trackings by creation date (newest first)
        const sortedTrackings = [
          ...orderResponse.data.data.orderTrackings,
        ].sort(
          (a: OrderTracking, b: OrderTracking) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrderTrackings(sortedTrackings);
      } else {
        // Fetch order tracking data separately if not included
        const trackingResponse = await axios.get(
          `https://kfsapis.azurewebsites.net/api/v1/orders/${orderId}/order-trackings`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Sort trackings by creation date (newest first)
        const sortedTrackings = trackingResponse.data.data.sort(
          (a: OrderTracking, b: OrderTracking) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrderTrackings(sortedTrackings);
      }
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  // Format date to display in a more readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return (
      date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // Get status color based on current status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finished":
        return "bg-green-100 text-green-600";
      case "PendingPayment":
        return "bg-yellow-100 text-yellow-600";
      case "Pending":
        return "bg-blue-100 text-blue-600";
      case "Confirmed":
        return "bg-blue-100 text-blue-600";
      case "Delivering":
        return "bg-purple-100 text-purple-600";
      case "Delivered":
        return "bg-green-100 text-green-600";
      case "Cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleCancel = async () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
            setCancelLoading(true);
            const userData = await AsyncStorage.getItem("userData");
            if (!userData) {
              return;
            }

            const parsedToken = JSON.parse(userData);
            const jwtToken = parsedToken?.accessToken;

            await axios.put(
              `https://kfsapis.azurewebsites.net/api/v1/orders/cancelled/${orderId}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${jwtToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            // Refresh order data after cancellation
            fetchOrderData();
            Alert.alert("Success", "Order has been cancelled successfully");
          } catch (error: any) {
            console.error(
              "Error cancelling order:",
              error.response?.data?.Message || error.message
            );
            Alert.alert(
              "Error",
              error.response?.data?.Message || "Failed to cancel order"
            );
          } finally {
            setCancelLoading(false);
          }
        },
      },
    ]);
  };

  const canCancelOrder = () => {
    return order && ["Pending", "PendingPayment"].includes(order.status);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff0000" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-700">Không có dữ liệu đơn hàng</Text>
      </View>
    );
  }

  // Calculate total items
  const totalItems = order.orderDetails.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="w-full mb-2 flex-row items-center space-x-4 bg-white pb-3 pt-4">
        <TouchableOpacity
          onPress={() => router.push(`/(components)/order/OrderHome`)}
          className="p-2 rounded-full bg-gray-200 ml-2"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="font-bold text-3xl text-gray-900">Order Detail</Text>
          <Text className="font-light text-gray-500">
            Order #{order.id.substring(0, 8)}
          </Text>
        </View>
      </View>

      {/* Order Status */}
      <View className="bg-white m-3 rounded-lg shadow-sm">
        <View
          className={`${
            getStatusColor(order.status).split(" ")[0]
          } p-4 rounded-t-lg`}
        >
          <Text
            className={`${
              getStatusColor(order.status).split(" ")[1]
            } font-bold text-lg`}
          >
            {order.status}
          </Text>
          <Text
            className={`${getStatusColor(order.status).split(" ")[1]} text-sm`}
          >
            {order.latestOrderTracking?.description || "Processing"}
          </Text>
        </View>

        {/* Latest Tracking Info */}
        <View className="p-4 flex-row items-center">
          <MaterialCommunityIcons
            name="truck-fast-outline"
            size={24}
            color="#4b5563"
          />
          <View className="ml-3">
            <Text className="text-gray-800">
              {order.latestOrderTracking?.description || "Processing"}
            </Text>
            <Text className="text-gray-500 text-sm">
              {formatDate(order.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Cancel Order Button */}
      {canCancelOrder() && (
        <View className="mx-3 mb-4">
          <TouchableOpacity
            onPress={handleCancel}
            disabled={cancelLoading}
            className="bg-red-500 py-3 px-4 rounded-lg items-center"
          >
            {cancelLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold">Cancel Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Customer Information */}
      <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
        <Text className="text-gray-700 font-semibold text-lg mb-3">
          Customer Information
        </Text>
        <View className="mb-2">
          <Text className="text-black text-xl font-medium">
            {order.receiverName}
          </Text>
          <Text className="text-gray-500">{order.contactPhoneNumber}</Text>
        </View>
        <View className="mb-2">
          <Text className="text-gray-700 font-medium">Shipping Address</Text>
          <Text className="text-gray-600">{order.shippingAddress}</Text>
        </View>
        {order.notes && (
          <View className="mb-2">
            <Text className="text-gray-700 font-medium">Notes</Text>
            <Text className="text-gray-600">{order.notes}</Text>
          </View>
        )}
      </View>

      {/* Order Items */}
      <View className="m-3">
        <Text className="text-gray-700 font-semibold text-lg mb-2">
          Order Items ({totalItems})
        </Text>
        {order.orderDetails.map((item, index) => (
          <View key={index} className="bg-white p-4 rounded-lg mb-3 shadow-sm">
            <View className="flex-row">
              <Image
                source={{ uri: item.productImageUrl }}
                className="w-20 h-20 rounded-md"
              />
              <View className="ml-4 flex-1">
                <Text className="text-gray-800 text-lg font-semibold">
                  {item.productName}
                </Text>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-gray-600">
                    Quantity: {item.quantity}
                  </Text>
                  <Text className="text-black font-medium">
                    {item.unitPrice.toLocaleString()} VNĐ
                  </Text>
                </View>
              </View>
            </View>
            <View className="border-b border-gray-200 my-3" />
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Item Total:</Text>
              <Text className="text-red-500 font-bold">
                {item.amount.toLocaleString()} VNĐ
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Order Tracking Timeline */}
      <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
        <Text className="text-gray-700 font-semibold text-lg mb-3">
          Order Tracking
        </Text>
        {orderTrackings.map((tracking, index) => (
          <View key={index} className="flex-row mb-4">
            {/* Timeline line */}
            <View className="items-center mr-4">
              <View
                className={`w-4 h-4 rounded-full ${
                  index === 0 ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              {index !== orderTrackings.length - 1 && (
                <View className="w-0.5 h-16 bg-gray-300" />
              )}
            </View>

            {/* Tracking details */}
            <View className="flex-1">
              <View
                className={`px-3 py-1 rounded-full self-start ${
                  getStatusColor(tracking.currentStatus).split(" ")[0]
                }`}
              >
                <Text
                  className={
                    getStatusColor(tracking.currentStatus).split(" ")[1]
                  }
                >
                  {tracking.currentStatus}
                </Text>
              </View>
              <Text className="text-gray-800 font-medium mt-1">
                {tracking.description}
              </Text>
              <Text className="text-gray-500 text-sm">
                {formatDate(tracking.createdAt)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Payment Information */}
      <View className="bg-white p-4 rounded-lg m-3 shadow-sm">
        <Text className="font-semibold text-gray-700 text-lg mb-3">
          Payment Summary
        </Text>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Subtotal</Text>
          <Text className="text-gray-800">
            {order.totalAmount.toLocaleString()} VNĐ
          </Text>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Shipping</Text>
          <Text className="text-gray-800">
            {order.shippingCost.toLocaleString()} VNĐ
          </Text>
        </View>

        {order.accumulatePointsDiscount > 0 && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Points Discount</Text>
            <Text className="text-green-600">
              -{order.accumulatePointsDiscount.toLocaleString()} VNĐ
            </Text>
          </View>
        )}

        {order.membershipDiscount > 0 && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Membership Discount</Text>
            <Text className="text-green-600">
              -{order.membershipDiscount.toLocaleString()} VNĐ
            </Text>
          </View>
        )}

        <View className="border-t border-gray-200 my-2" />

        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-800 font-bold">Total</Text>
          <Text className="text-red-500 font-bold text-lg">
            {order.finalAmount.toLocaleString()} VNĐ
          </Text>
        </View>
      </View>

      {/* Order Information */}
      <View className="bg-white p-4 rounded-lg m-3 mb-6 shadow-sm">
        <Text className="font-semibold text-gray-700 text-lg mb-3">
          Order Information
        </Text>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Order ID</Text>
          <Text className="text-gray-800">{order.id.substring(0, 23)}...</Text>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Order Date</Text>
          <Text className="text-gray-800">{formatDate(order.createdAt)}</Text>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Payment Method</Text>
          <Text className="text-orange-600">{order.paymentMethodName}</Text>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Payment Status</Text>
          <Text className={order.isPaid ? "text-green-600" : "text-red-500"}>
            {order.isPaid ? "Paid" : "Unpaid"}
          </Text>
        </View>

        {order.paymentAt && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Payment Date</Text>
            <Text className="text-gray-800">{formatDate(order.paymentAt)}</Text>
          </View>
        )}

        {order.deliveredAt && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Delivered Date</Text>
            <Text className="text-gray-800">
              {formatDate(order.deliveredAt)}
            </Text>
          </View>
        )}

        {order.cancelledReason && (
          <View className="mt-2 ">
            <Text className="text-gray-600">Cancellation Reason: </Text>
            <Text className="text-red-500 mt-1 justify-end text-right">
              {order.cancelledReason}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
