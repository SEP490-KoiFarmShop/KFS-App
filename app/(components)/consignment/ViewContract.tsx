import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useRef, useState } from "react";
import { TextInput } from "react-native-paper";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ContractDetail() {
    const { id } = useLocalSearchParams();
    const today = new Date();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const formattedDate = `${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    const contractRef = useRef(null);

    const contractContent = `
        HỢP ĐỒNG KÝ GỬI CÁ
        Ngày ${formattedDate}

        BÊN A (BÊN KÝ GỬI)
        - Họ và tên: Nguyễn Văn A
        - Số CMND/CCCD: ___________
        - Địa chỉ: ___________
        - Số điện thoại: ___________

        BÊN B (BÊN NHẬN KÝ GỬI)
        - Tên cửa hàng: Koi Farm Shop
        - Địa chỉ: 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh
        - Số điện thoại: 028 7300 5588

        ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG
        - Loại cá: ___________
        - Đặc điểm nhận diện: ___________
        - Giá ký gửi: 1.200 USD

        ĐIỀU 2: QUYỀN VÀ NGHĨA VỤ CÁC BÊN
        - Bên A: Giám sát cá, thanh toán phí dịch vụ.
        - Bên B: Đảm bảo môi trường sống, chịu trách nhiệm tổn thất.

        ĐIỀU 3: PHƯƠNG THỨC THANH TOÁN
        - Số tiền: 1.200 USD.

        ĐIỀU 4: VI PHẠM HỢP ĐỒNG
        - Vi phạm hợp đồng sẽ bồi thường theo thoả thuận.

        ĐIỀU 5: ĐIỀU KHOẢN CHUNG
        - Hợp đồng có hiệu lực từ ngày ký.
    `;

    // const uploadImage = async (imageUri: string) => {
    //     try {
    //         const fileType = "image/png";

    //         const formData = new FormData();
    //         formData.append("file", {
    //             uri: imageUri,
    //             name: "contract.png",
    //             type: fileType,
    //         } as any);

    //         const response = await axios.post("https://kfsapis.azurewebsites.net/api/v1/media", formData, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data",
    //             },
    //         });

    //         console.log("Upload thành công:", response.data);
    //         Alert.alert("Thành công", "Hợp đồng đã được lưu!");

    //     } catch (error) {
    //         Alert.alert("Lỗi", "Không thể lưu hợp đồng!");
    //         console.error("Lỗi upload ảnh:", error);
    //     }
    // };

    // const sendOtp = async () => {
    //     if (!email) {
    //         Alert.alert("Lỗi", "Vui lòng nhập email");
    //         return;
    //     }
    //     try {
    //         const response = await axios.post("https://kfsapis.azurewebsites.net/api/Otp/send-otp", {
    //             email: email,
    //         });
    //         Alert.alert("Thành công", "OTP đã được gửi đến email của bạn!");
    //         router.push(`/(components)/OTPConfirm?gmail=${email}`)
    //     } catch (error) {
    //         Alert.alert("Lỗi", "Không thể gửi OTP. Vui lòng thử lại!");
    //         console.error("Lỗi gửi OTP:", error);
    //     }
    // };

    const captureContract = async () => {
        try {
            if (!contractRef.current) {
                Alert.alert("Lỗi", "Không thể chụp ảnh hợp đồng vì không tìm thấy component.");
                return null;
            }

            const uri = await captureRef(contractRef.current, {
                format: "png",
                quality: 0.8,
            });

            console.log("Captured Image URI: ", uri);
            return uri;
        } catch (error) {
            console.error("Lỗi chụp ảnh:", error);
            Alert.alert("Lỗi", "Không thể chụp ảnh hợp đồng!");
            return null;
        }
    };


    const uploadImage = async (imageUri: string) => {
        try {
            const formData = new FormData();
            formData.append("file", {
                uri: imageUri,
                name: "contract.png",
                type: "image/png",
            } as any);

            const response = await axios.post("https://kfsapis.azurewebsites.net/api/v1/media", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Upload response:", response.data);
            return response.data.url;
        } catch (error: any) {
            console.error("Lỗi upload ảnh:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Không thể lưu hợp đồng!");
            return null;
        }
    };


    const sendOtp = async () => {
        if (!email) {
            Alert.alert("Lỗi", "Vui lòng nhập email");
            return;
        }
        try {
            await axios.post("https://kfsapis.azurewebsites.net/api/Otp/send-otp", { email });
            Alert.alert("Thành công", "OTP đã được gửi đến email của bạn!");
            router.push(`/(components)/consignment/OTPConfirm?gmail=${email}&id=${id}`);
        } catch (error) {
            console.error("Lỗi gửi OTP:", error);
            Alert.alert("Lỗi", "Không thể gửi OTP!");
        }
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const createContract = async (fileUrl: string) => {
        try {
            const consignmentId = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id, 10);

            if (isNaN(consignmentId)) {
                console.error("ID không hợp lệ:", id);
                //Alert.alert("Lỗi", "ID không hợp lệ!");
                return;
            }
            const today = new Date();
            const requestData = {
                koiConsignmentId: consignmentId,
                content: contractContent,
                effectiveDate: formatDate(today),
                expirationDate: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())),
                contractFileUrl: fileUrl,
            };

            console.log("Dữ liệu gửi đi:", requestData);

            const response = await axios.post("https://kfsapis.azurewebsites.net/api/Consignment/CreateContract", requestData);

            console.log("check data", response.data);
            //Alert.alert("Thành công", "Hợp đồng đã được tạo!");
        } catch (error) {
            console.error("Lỗi tạo hợp đồng:", error);
            Alert.alert("Lỗi", "Không thể tạo hợp đồng!");
        }
    };

    const handleAccepted = async () => {
        try {
            const userData = await AsyncStorage.getItem("userData");
            if (!userData) {
                router.push("/(auth)/LoginScreen");
                return;
            }
            const parsedToken = JSON.parse(userData);
            const jwtToken = parsedToken?.accessToken;

            await axios.put(`https://kfsapis.azurewebsites.net/api/Consignment/ChangeStatusForCustomer`, null, {
                params: {
                    consignmentId: id,
                    status: "Accepted",
                },
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
            });
            //Alert.alert("Success", "Consignment has been accepted.");
            // router.push(`/(components)/consignment/ViewContract?id=${id}`)
        } catch (error) {
            console.error("Error rejecting consignment:", error);
            Alert.alert("Error", "Failed to reject consignment.");
        }
    };

    const captureAndSaveImage = async () => {
        try {
            if (!contractRef.current) {
                Alert.alert("Lỗi", "Không thể chụp ảnh hợp đồng.");
                return null;
            }

            const uri = await captureRef(contractRef.current, {
                format: "png",
                quality: 0.8,
            });

            const fileUri = `${FileSystem.documentDirectory}contract.png`;
            await FileSystem.copyAsync({ from: uri, to: fileUri });

            console.log("Saved image at:", fileUri);
            return fileUri;
        } catch (error) {
            console.error("Lỗi chụp ảnh:", error);
            Alert.alert("Lỗi", "Không thể chụp ảnh hợp đồng!");
            return null;
        }
    };

    const handleConfirm = async () => {
        if (!email.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập email trước khi xác nhận!");
            return;
        }
        try {
            const imageUri = await captureAndSaveImage();
            if (!imageUri) {
                Alert.alert("Lỗi", "Không thể chụp ảnh hợp đồng!");
                return;
            }

            const fileUrl = await uploadImage(imageUri);
            if (!fileUrl) {
                Alert.alert("Lỗi", "Không thể tải lên hình ảnh hợp đồng!");
                return;
            }
            await handleAccepted();
            await createContract(fileUrl);
            await sendOtp();

        } catch (error) {
            console.error("Lỗi trong quá trình xác nhận:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi trong quá trình xử lý hợp đồng.");
        }
    };

    return (
        <View className="flex-1 bg-white p-4">
            <View className="items-center border-b pb-3 mb-3">
                <Text className="text-xl font-bold">HỢP ĐỒNG KÝ GỬI CÁ</Text>
                <Text className="text-gray-500">Ngày {formattedDate}</Text>
            </View>

            {/* Bọc hợp đồng trong ViewShot */}
            <ViewShot ref={contractRef} options={{ format: "png", quality: 0.8 }} style={{ flex: 1, backgroundColor: "white", padding: 10 }} >
                <ScrollView className="flex-1">
                    <View className="mb-4">
                        <Text className="font-bold">BÊN A (BÊN KÝ GỬI)</Text>
                        <Text>- Họ và tên: Nguyễn Văn A</Text>
                        <Text>- Số CMND/CCCD: ___________</Text>
                        <Text>- Địa chỉ: ___________</Text>
                        <Text>- Số điện thoại: ___________</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="font-bold">BÊN B (BÊN NHẬN KÝ GỬI)</Text>
                        <Text>- Tên cửa hàng: Koi Farm Shop</Text>
                        <Text>- Địa chỉ: 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh</Text>
                        <Text>- Số điện thoại: 028 7300 5588</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="font-bold">ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG</Text>
                        <Text>1. Bên A đồng ý ký gửi cá với thông tin như sau:</Text>
                        <Text>- Loại cá: ___________</Text>
                        <Text>- Đặc điểm nhận diện: ___________</Text>
                        <Text>- Giá ký gửi: 1.200 USD</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="font-bold">ĐIỀU 2: QUYỀN VÀ NGHĨA VỤ CÁC BÊN</Text>
                        <Text>1. Quyền và nghĩa vụ của Bên A:</Text>
                        <Text>- Giám sát cá trong suốt thời gian ký gửi.</Text>
                        <Text>- Thanh toán đầy đủ phí dịch vụ.</Text>
                        <Text>2. Quyền và nghĩa vụ của Bên B:</Text>
                        <Text>- Đảm bảo môi trường sống cho cá.</Text>
                        <Text>- Chịu trách nhiệm nếu cá bị tổn thất.</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="font-bold">ĐIỀU 3: PHƯƠNG THỨC THANH TOÁN</Text>
                        <Text>- Bên A thanh toán theo kỳ hoặc 1 lần.</Text>
                        <Text>- Số tiền: 1.200 USD.</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="font-bold">ĐIỀU 4: VI PHẠM HỢP ĐỒNG</Text>
                        <Text>- Nếu bên nào vi phạm, bên kia có quyền yêu cầu bồi thường.</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="font-bold">ĐIỀU 5: ĐIỀU KHOẢN CHUNG</Text>
                        <Text>- Hợp đồng có hiệu lực từ ngày ký.</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="font-bold">Nhập email để nhận OTP</Text>
                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="border p-2 rounded-md"
                        />
                    </View>
                </ScrollView>
            </ViewShot>

            <TouchableOpacity className="bg-green-500 p-3 rounded-lg mt-4" onPress={handleConfirm}>
                <Text className="text-center text-white font-bold">Make a contract</Text>
            </TouchableOpacity>
        </View>
    );
}
