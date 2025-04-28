import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageSourcePropType,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from "@expo/vector-icons/Entypo";
import { FontAwesome5 } from "@expo/vector-icons";

interface KoiFishConsignment {
  productId: number;
  name: string;
  origin: string;
  quantity: number;
  weight: number;
  personality: string;
  feedingAmountPerDay: number;
  healthStatus: string;
  screeningRate: number;
  price: number;
  status: string;
  exchangeMethod: string;
  isInConsignment: boolean;
  consignCustomerName: string;
  imageUrl: string;
  certificateImageUrl: string;
  breeders: string;
  varieties: string;
  bornDate: string;
  size: number;
  gender: string;
  fromSize: number;
  toSize: number;
  createConsignmentModel: {
    varieties: string;
    gender: string;
    bornDate: string;
    source: string;
    methodOFSelling: string;
    methodOfConsignment: string;
    fromDate: string;
    toDate: string;
    desiredPrice: number;
    notes: string;
    imageUrls: string[];
    certificateUrls: string[];
  };
}

interface ConsignmentData {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  varieties: string;
  varietyIds: number[];
  gender: string;
  bornDate: string;
  source: string;
  methodOFSelling: string;
  methodOfConsignment: string;
  fromDate: string;
  toDate: string;
  desiredPrice: number;
  priceAgreed: number;
  pickupDate: string;
  notes: string;
  imageUrls: string[];
  certificateUrls: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  finalPayoutAmount: number | null;
  totalConsignmentFees: number | null;
  isDeposit: boolean;
  depositAmount: number;
  isPaymentCompleted: boolean;
  paymentCompletedDate: string | null;
  isCancelledByCustomer: boolean;
  cancelledDate: string | null;
  cancelReason: string | null;
  isExtended: boolean;
  extensionCount: number;
  extendedUntil: string | null;
  staffId: number;
  staffName: string;
  koiFishConsignment: KoiFishConsignment;
  commissionFee: string | number | null;
}

interface AmountDetailData {
  consignmentId: number;
  customerName: string;
  customerEmail: string;
  productId: number;
  productName: string;
  productPrice: number;
  consignmentType: string;
  consignmentMode: string;
  consignmentStatus: string;
  depositAmount: number;
  fishCareFee: number;
  commissionFee: number | null;
  invoiceFinalAmount: number | null;
  orderFinalAmount: number;
  finalPayoutAmount: number;
  totalConsignmentFees: number;
}

type TabType = "details" | "request" | "finance";

// Helper function to safely format numbers
const safeFormat = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "string") {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : numValue.toLocaleString();
  }
  return value.toLocaleString();
};

const ConsignmentDetail: React.FC = () => {
  const [consignmentData, setConsignmentData] =
    useState<ConsignmentData | null>(null);
  const [amountDetailData, setAmountDetailData] =
    useState<AmountDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        if (!id) {
          throw new Error("Consignment ID is missing");
        }

        // Fetch consignment details
        const consignmentResponse = await axios.get<ConsignmentData>(
          `https://kfsapis.azurewebsites.net/api/Consignment/Detail?id=${id}`
        );
        setConsignmentData(consignmentResponse.data);

        // Fetch amount details
        const amountResponse = await axios.get<AmountDetailData>(
          `https://kfsapis.azurewebsites.net/api/Consignment/AmountDetail?id=${id}`
        );
        setAmountDetailData(amountResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch consignment details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReject = async (): Promise<void> => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        router.push("/(auth)/LoginScreen");
        return;
      }
      const parsedToken = JSON.parse(userData);
      const jwtToken = parsedToken?.accessToken;

      if (!consignmentData?.id) {
        throw new Error("Consignment ID is missing");
      }

      await axios.put(
        `https://kfsapis.azurewebsites.net/api/Consignment/ChangeStatusForCustomer`,
        null,
        {
          params: {
            consignmentId: consignmentData.id,
            status: "Rejected",
          },
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Success", "Consignment has been rejected.");
      router.push("/");
    } catch (error) {
      console.error("Error rejecting consignment:", error);
      Alert.alert("Error", "Failed to reject consignment.");
    }
  };

  const handleAccepted = async (): Promise<void> => {
    try {
      Alert.alert("Success", "Consignment has been accepted.");
      router.push(`/(components)/consignment/ViewContract?id=${id}`);
    } catch (error) {
      console.error("Error accepting consignment:", error);
      Alert.alert("Error", "Failed to accept consignment.");
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (
    status: string
  ): { bgColor: string; textColor: string } => {
    switch (status) {
      case "Accepted":
        return { bgColor: "bg-green-100", textColor: "text-green-700" };
      case "Rejected":
        return { bgColor: "bg-red-100", textColor: "text-red-700" };
      case "Pending":
        return { bgColor: "bg-yellow-100", textColor: "text-yellow-700" };
      case "Approved":
        return { bgColor: "bg-blue-100", textColor: "text-blue-700" };
      case "Completed":
        return { bgColor: "bg-purple-100", textColor: "text-purple-700" };
      default:
        return { bgColor: "bg-gray-100", textColor: "text-gray-700" };
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (!consignmentData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">No data available</Text>
      </View>
    );
  }

  const statusColors = getStatusColor(consignmentData.status);

  const renderDetailTab = (): React.ReactElement => (
    <>
      {/* Images Carousel */}
      <View className="mt-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(consignmentData.imageUrls && consignmentData.imageUrls.length > 0
            ? consignmentData.imageUrls
            : [
                require("../../../assets/icon/defaultimage.jpg") as ImageSourcePropType,
              ]
          ).map((img, index) => (
            <Image
              key={index}
              className="w-[250px] h-[300px] mx-2"
              source={typeof img === "string" ? { uri: img } : img}
              resizeMode="contain"
            />
          ))}
        </ScrollView>
      </View>

      {/* Name and Status Badge - Moved here from above */}
      <View className="mx-5 mt-4 flex-row justify-between items-center">
        <Text className="text-xl font-bold">
          {consignmentData.koiFishConsignment?.name || "Consignment"}
        </Text>
        <View className={`px-3 py-1 rounded-full ${statusColors.bgColor}`}>
          <Text className={`font-medium ${statusColors.textColor}`}>
            {consignmentData.status}
          </Text>
        </View>
      </View>

      {/* Price */}
      <View className="mx-5 mt-4">
        <Text className="font-semibold text-orange-600 text-xl">
          {typeof consignmentData.desiredPrice === "number"
            ? consignmentData.desiredPrice.toLocaleString()
            : "N/A"}{" "}
          VNĐ
        </Text>
        {consignmentData.isDeposit && (
          <Text className="text-green-600 mt-1">
            Deposit:{" "}
            {typeof consignmentData.depositAmount === "number"
              ? consignmentData.depositAmount.toLocaleString()
              : "N/A"}{" "}
            VNĐ
          </Text>
        )}
      </View>

      {/* Koi Information */}
      <View className="mx-5 mt-4 bg-white p-4 rounded-lg shadow-sm">
        <Text className="font-bold text-lg mb-3">Koi Information</Text>

        <View className="flex-row items-center mb-2">
          <FontAwesome5 name="fish" size={16} color="#666" />
          <Text className="text-gray-700 ml-2">Variety: </Text>
          <Text className="font-medium">{consignmentData.varieties}</Text>
        </View>

        <View className="flex-row items-center mb-2">
          <FontAwesome5 name="venus-mars" size={16} color="#666" />
          <Text className="text-gray-700 ml-2">Gender: </Text>
          <Text className="font-medium">{consignmentData.gender}</Text>
        </View>

        <View className="flex-row items-center mb-2">
          <FontAwesome5 name="ruler" size={16} color="#666" />
          <Text className="text-gray-700 ml-2">Size: </Text>
          <Text className="font-medium">
            {consignmentData.koiFishConsignment?.size || "N/A"} cm
          </Text>
        </View>

        <View className="flex-row items-center mb-2">
          <FontAwesome5 name="calendar-alt" size={16} color="#666" />
          <Text className="text-gray-700 ml-2">Born Date: </Text>
          <Text className="font-medium">
            {formatDate(consignmentData.bornDate)}
          </Text>
        </View>

        {/* <View className="flex-row items-center mb-2">
          <FontAwesome5 name="calendar-alt" size={16} color="#666" />
          <Text className="text-gray-700 ml-2">Pick up Date: </Text>
          <Text className="font-medium">
            {formatDate(consignmentData?.pickupDate) || "Unknown"}
          </Text>
        </View> */}

        <View className="flex-row items-center mb-2">
          <FontAwesome5 name="store" size={16} color="#666" />
          <Text className="text-gray-700 ml-2">Source: </Text>
          <Text className="font-medium">{consignmentData.source}</Text>
        </View>

        <View className="flex-row items-center mb-2">
          <FontAwesome5 name="tags" size={16} color="#666" />
          <Text className="text-gray-700 ml-2">Selling Method: </Text>
          <Text className="font-medium">{consignmentData.methodOFSelling}</Text>
        </View>

        <View className="mt-3">
          <Text className="text-gray-700 font-medium">Notes:</Text>
          <Text className="text-gray-600 mt-1">
            {consignmentData.notes || "No notes provided"}
          </Text>
        </View>

        <View className="mt-3">
          <Text className="text-gray-700 font-semibold">Commission Fee:</Text>
          <Text className="text-gray-600 mt-1">
            {consignmentData.commissionFee !== null
              ? safeFormat(consignmentData.commissionFee) + " VNĐ"
              : "No commission provided"}
          </Text>
        </View>
      </View>

      {/* Certificates */}
      <View className="mx-5 mt-4 bg-white p-4 rounded-lg shadow-sm">
        <Text className="font-bold text-lg mb-3">Certificates</Text>
        {consignmentData.certificateUrls &&
        consignmentData.certificateUrls.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {consignmentData.certificateUrls.map((cert, index) => (
              <Image
                key={index}
                className="w-[200px] h-[250px] mr-3"
                source={{ uri: cert }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        ) : (
          <Text className="text-gray-500 italic">
            No certificates available
          </Text>
        )}
      </View>
      {consignmentData.status !== "Approved" && (
        <View className="mx-5 mt-4 bg-white p-4 rounded-lg shadow-sm">
          <TouchableOpacity
            className=""
            onPress={() => router.push("consignment/ViewDetailContract")}
          >
            <Text className="text-blue-600 font-semibold text-lg text-center">
              View Contract Details
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const renderRequestTab = (): React.ReactElement => (
    <View className="mx-5 mt-4 bg-white p-4 rounded-lg shadow-sm">
      <Text className="font-bold text-lg mb-3">Your Consignment Request</Text>

      <View className="mb-4">
        <Text className="text-gray-700 font-medium">Customer Information:</Text>
        <Text className="text-gray-600 mt-1">
          Name: {consignmentData.customerName}
        </Text>
        <Text className="text-gray-600">
          Email: {consignmentData.customerEmail}
        </Text>
        <Text className="text-gray-600">
          Phone: {consignmentData.customerPhone}
        </Text>
        <Text className="text-gray-600">
          Address: {consignmentData.customerAddress}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-medium">Consignment Period:</Text>
        <Text className="text-gray-600 mt-1">
          From: {formatDate(consignmentData.fromDate)} to{" "}
          {formatDate(consignmentData.toDate)}
        </Text>
        {consignmentData.isExtended && (
          <Text className="text-blue-600">
            Extended until: {formatDate(consignmentData.extendedUntil)}
            {consignmentData.extensionCount > 0 && (
              <Text> (Extended {consignmentData.extensionCount} times)</Text>
            )}
          </Text>
        )}
        {consignmentData.pickupDate && (
          <Text className="text-gray-600">
            Pickup Date: {formatDate(consignmentData.pickupDate)}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-medium">Pricing:</Text>
        <Text className="text-gray-600 mt-1">
          Desired Price:{" "}
          {typeof consignmentData.desiredPrice === "number"
            ? consignmentData.desiredPrice.toLocaleString()
            : "N/A"}{" "}
          VNĐ
        </Text>
        {consignmentData.priceAgreed > 0 && (
          <Text className="text-gray-600">
            Agreed Price: {consignmentData.priceAgreed.toLocaleString()} VNĐ
          </Text>
        )}
        {consignmentData.finalPayoutAmount !== null && (
          <Text className="text-green-600">
            Final Payout: {consignmentData.finalPayoutAmount.toLocaleString()}{" "}
            VNĐ
          </Text>
        )}
        {consignmentData.totalConsignmentFees !== null && (
          <Text className="text-gray-600">
            Total Fees: {consignmentData.totalConsignmentFees.toLocaleString()}{" "}
            VNĐ
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-medium">Payment Status:</Text>
        <View className="flex-row items-center mt-1">
          <View
            className={`w-3 h-3 rounded-full mr-2 ${
              consignmentData.isDeposit ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <Text
            className={`${
              consignmentData.isDeposit ? "text-green-600" : "text-gray-500"
            }`}
          >
            Deposit: {consignmentData.isDeposit ? "Paid" : "Not Paid"}
            {typeof consignmentData.depositAmount === "number" &&
            consignmentData.depositAmount > 0 ? (
              <Text>
                {" "}
                ({consignmentData.depositAmount.toLocaleString()} VNĐ)
              </Text>
            ) : null}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <View
            className={`w-3 h-3 rounded-full mr-2 ${
              consignmentData.isPaymentCompleted
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          />
          <Text
            className={`${
              consignmentData.isPaymentCompleted
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            Final Payment:{" "}
            {consignmentData.isPaymentCompleted ? (
              <Text>
                Completed on {formatDate(consignmentData.paymentCompletedDate)}
              </Text>
            ) : (
              <Text>Not Completed</Text>
            )}
          </Text>
        </View>
      </View>

      {consignmentData.isCancelledByCustomer && (
        <View className="mb-4">
          <Text className="text-gray-700 font-medium">Cancellation:</Text>
          <Text className="text-red-600 mt-1">
            Cancelled on {formatDate(consignmentData.cancelledDate)}
          </Text>
          {consignmentData.cancelReason && (
            <Text className="text-gray-600">
              Reason: {consignmentData.cancelReason}
            </Text>
          )}
        </View>
      )}

      {consignmentData.staffName && (
        <View className="mb-4">
          <Text className="text-gray-700 font-medium">Staff Assigned:</Text>
          <Text className="text-gray-600 mt-1">
            {consignmentData.staffName} (ID: {consignmentData.staffId})
          </Text>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-gray-700 font-medium">Request Timeline:</Text>
        <Text className="text-gray-600 mt-1">
          Created: {formatDate(consignmentData.createdAt)}
        </Text>
        <Text className="text-gray-600">
          Last Updated: {formatDate(consignmentData.updatedAt)}
        </Text>
      </View>
    </View>
  );

  const renderFinanceTab = (): React.ReactElement => (
    <View className="mx-5 mt-4 bg-white p-4 rounded-lg shadow-sm">
      <Text className="font-bold text-lg mb-3">Financial Details</Text>

      {!amountDetailData ? (
        <Text className="text-gray-500 italic">
          No financial data available
        </Text>
      ) : (
        <>
          <View className="mb-4">
            <Text className="text-gray-700 font-medium">
              Product Information:
            </Text>
            {amountDetailData.productName && (
              <Text className="text-gray-600 mt-1">
                Name: {amountDetailData.productName}
              </Text>
            )}
            {typeof amountDetailData.productPrice === "number" && (
              <Text className="text-gray-600">
                Price: {amountDetailData.productPrice.toLocaleString()} VNĐ
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium">Consignment Type:</Text>
            {amountDetailData.consignmentType && (
              <Text className="text-gray-600 mt-1">
                Type: {amountDetailData.consignmentType}
              </Text>
            )}
            {amountDetailData.consignmentMode && (
              <Text className="text-gray-600">
                Mode: {amountDetailData.consignmentMode}
              </Text>
            )}
            {amountDetailData.consignmentStatus && (
              <Text className="text-gray-600">
                Status: {amountDetailData.consignmentStatus}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium">
              Financial Breakdown:
            </Text>

            {typeof amountDetailData.depositAmount === "number" && (
              <View className="mt-2 border-b border-gray-200 pb-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Deposit Amount:</Text>
                  <Text className="font-medium">
                    {amountDetailData.depositAmount.toLocaleString()} VNĐ
                  </Text>
                </View>
              </View>
            )}

            {typeof amountDetailData.fishCareFee === "number" && (
              <View className="mt-2 border-b border-gray-200 pb-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Fish Care Fee:</Text>
                  <Text className="font-medium">
                    {amountDetailData.fishCareFee.toLocaleString()} VNĐ
                  </Text>
                </View>
              </View>
            )}

            {typeof amountDetailData.commissionFee === "number" && (
              <View className="mt-2 border-b border-gray-200 pb-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Commission Fee:</Text>
                  <Text className="font-medium">
                    {amountDetailData.commissionFee.toLocaleString()} VNĐ
                  </Text>
                </View>
              </View>
            )}

            {typeof amountDetailData.totalConsignmentFees === "number" && (
              <View className="mt-2 border-b border-gray-200 pb-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total Consignment Fees:</Text>
                  <Text className="font-medium">
                    {amountDetailData.totalConsignmentFees.toLocaleString()} VNĐ
                  </Text>
                </View>
              </View>
            )}

            {typeof amountDetailData.invoiceFinalAmount === "number" && (
              <View className="mt-2 border-b border-gray-200 pb-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Invoice Final Amount:</Text>
                  <Text className="font-medium">
                    {amountDetailData.invoiceFinalAmount.toLocaleString()} VNĐ
                  </Text>
                </View>
              </View>
            )}

            {typeof amountDetailData.orderFinalAmount === "number" && (
              <View className="mt-2 border-b border-gray-200 pb-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Order Final Amount:</Text>
                  <Text className="font-medium">
                    {amountDetailData.orderFinalAmount.toLocaleString()} VNĐ
                  </Text>
                </View>
              </View>
            )}

            {typeof amountDetailData.finalPayoutAmount === "number" && (
              <View className="mt-4 pt-2 bg-gray-50 p-3 rounded">
                <View className="flex-row justify-between">
                  <Text className="text-green-700 font-bold">
                    Final Payout Amount:
                  </Text>
                  <Text className="text-green-700 font-bold">
                    {amountDetailData.finalPayoutAmount.toLocaleString()} VNĐ
                  </Text>
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-5 bg-white shadow-md">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-100"
        >
          <Entypo name="chevron-thin-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-bold">Consignment Detail</Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row mx-5 mt-4 border-b border-gray-200">
        <TouchableOpacity
          className={`pb-2 mr-6 ${
            activeTab === "details" ? "border-b-2 border-orange-500" : ""
          }`}
          onPress={() => setActiveTab("details")}
        >
          <Text
            className={`font-semibold ${
              activeTab === "details" ? "text-orange-500" : "text-gray-600"
            }`}
          >
            Koi Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`pb-2 mr-6 ${
            activeTab === "request" ? "border-b-2 border-orange-500" : ""
          }`}
          onPress={() => setActiveTab("request")}
        >
          <Text
            className={`font-semibold ${
              activeTab === "request" ? "text-orange-500" : "text-gray-600"
            }`}
          >
            Request
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`pb-2 ${
            activeTab === "finance" ? "border-b-2 border-orange-500" : ""
          }`}
          onPress={() => setActiveTab("finance")}
        >
          <Text
            className={`font-semibold ${
              activeTab === "finance" ? "text-orange-500" : "text-gray-600"
            }`}
          >
            Financial
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "details"
          ? renderDetailTab()
          : activeTab === "request"
          ? renderRequestTab()
          : renderFinanceTab()}
      </ScrollView>

      {consignmentData.status === "Approved" && (
        <View className="flex-row justify-between px-5 bg-white pt-3 pb-5 shadow-t">
          <CustomButton
            title="Reject"
            handlePress={handleReject}
            containerStyles="bg-red-500 h-14 flex-1 mr-2"
            textStyles="text-white"
            isLoading={false}
          />

          <CustomButton
            title="Accept"
            handlePress={handleAccepted}
            containerStyles="bg-green-500 h-14 flex-1 ml-2"
            textStyles="text-white"
            isLoading={false}
          />
        </View>
      )}
    </View>
  );
};

export default ConsignmentDetail;
