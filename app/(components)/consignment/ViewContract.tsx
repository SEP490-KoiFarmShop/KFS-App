import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
    const [customerData, setCustomerData] = useState<any>(null);

    const contractRef = useRef(null);

    const contractContent = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h2 { text-align: center; }
            .section { margin-bottom: 20px; }
            .signature { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature div { text-align: center; }
        </style>
    </head>
    <body>
        <h1>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
        <h2>Độc lập – Tự do – Hạnh phúc</h2>
        <h2>GIẤY UỶ QUYỀN</h2>
        <div class="section">
            <h3>I. BÊN UỶ QUYỀN</h3>
            <p>Họ tên: ${customerData ? customerData.fullName : "Đang tải..."}</p>
            <p>Địa chỉ: ${customerData?.address || "Không xác định"}</p>
            <p>Số CCCD: ${customerData?.phoneNumber || "Không xác định"}</p>
            <p>Ngày cấp: Không xác định</p>
            <p>Quốc tịch: Việt Nam</p>
        </div>
        <div class="section">
            <h3>II. BÊN ĐƯỢC UỶ QUYỀN</h3>
            <p>Họ tên: Phan Thanh Khải</p>
            <p>Địa chỉ: S1.01 Vinhomes Grand Park, Tp. Thủ Đức, TP. Hồ Chí Minh</p>
            <p>Số CMND: 9876545678 cấp ngày: 21/01/2018</p>
            <p>Nơi cấp: tại Công an tỉnh Tp. Hồ Chí Minh</p>
            <p>Quốc tịch: Việt Nam</p>
        </div>
        <div class="section">
            <h3>III. NỘI DUNG UỶ QUYỀN</h3>
            <p>Bên Uỷ quyền đồng ý ủy quyền cho Bên Nhận Ủy quyền thực hiện các hành vi sau đây:</p>
            <ul>
                <li>Tiếp nhận, định đoạt và định giả tài phẩm từ cá Koi do Bên Uỷ quyền gửi.</li>
                <li>Được phép kiểm tra và nhận vật phẩm nêu trên khi hoàn thành thủ tục bán/đấu giá.</li>
                <li>Nhận tiền hoàn lại từ việc bán/đấu giá.</li>
                <li>Thay mặt bên uỷ quyền thực hiện, giám sát toàn bộ thủ tục bàn giao vật phẩm.</li>
            </ul>
        </div>
        <div class="section">
            <h3>IV. CAM KẾT</h3>
            <p>- Hai bên cam kết sẽ hoàn toàn chịu trách nhiệm trước Pháp luật về mọi thông tin uỷ quyền ở trên</p>
            <p>- Mọi tranh chấp phát sinh giữa quyền uỷ quyền và bên được uỷ quyền sẽ do hai bên tự giải quyết</p>
        </div>
        <div class="signature">
            <div>
                <p>BÊN UỶ QUYỀN</p>
                <p>(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
                <p>BÊN ĐƯỢC UỶ QUYỀN</p>
                <p>(Ký và ghi rõ họ tên)</p>
            </div>
        </div>
    </body>
    </html>
`;

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
            console.log(email);
            await axios.post(`https://kfsapis.azurewebsites.net/api/Otp/send-otp`, { email: email });
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
            // await handleAccepted();
            await createContract(fileUrl);
            await sendOtp();

        } catch (error) {
            console.error("Lỗi trong quá trình xác nhận:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi trong quá trình xử lý hợp đồng.");
        }
    };

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const userData = await AsyncStorage.getItem("userData");
                if (!userData) {
                    router.push("/(auth)/LoginScreen");
                    return;
                }

                const parsedToken = JSON.parse(userData);
                const id = parsedToken?.id;
                const jwtToken = parsedToken?.accessToken;
                const response = await axios.get("https://kfsapis.azurewebsites.net/api/v1/auth/GetCustomerDetail",
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                            "Content-Type": "application/json",
                        },
                    })

                setCustomerData(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
                Alert.alert("Lỗi", "Không thể lấy thông tin khách hàng.");
            }
        };
        fetchCustomerData();
    }, []);

    return (
        <View className="flex-1 bg-white p-4">
            {/* Bọc hợp đồng trong ViewShot */}
            <ViewShot ref={contractRef} options={{ format: "png", quality: 0.8 }} style={{ flex: 1, backgroundColor: "white", padding: 10 }} >
                <ScrollView className="flex-1">
                    <View className="p-4 bg-white">

                        {/* Document title */}
                        <View className="items-center mb-4">
                            <Text className="text-xl font-bold">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
                            <Text className="text-xl font-bold">Độc lập – Tự do – Hạnh phúc</Text>
                        </View>

                        <View className="items-center mb-6">
                            <Text className="text-lg font-bold">GIẤY UỶ QUYỀN</Text>
                            <Text className="text-sm">(Dành cho cá nhân)</Text>
                        </View>

                        {/* Document content */}
                        <Text className="mb-4">
                            - Căn cứ Bộ Luật Dân sự nước Cộng hoà xã hội chủ nghĩa Việt Nam. - Căn cứ vào các văn bản hiến pháp hiện hành.
                        </Text>
                        <Text className="mb-4">
                            TP. Hồ Chí Minh, ngày 31 tháng 3 năm 2025; chúng tôi gồm có:
                        </Text>

                        {/* Section I */}
                        <Text className="font-bold mb-2">I. BÊN UỶ QUYỀN</Text>
                        <Text className="mb-1">Họ tên: {customerData ? customerData.fullName : "Đang tải..."}</Text>
                        <Text className="mb-1">Địa chỉ: {customerData?.address || "Không xác định"}</Text>
                        <Text className="mb-1">Số CCCD: {customerData?.phoneNumber || "Không xác định"}</Text>
                        <Text className="mb-1">Ngày cấp: Không xác định</Text>
                        <Text className="mb-4">Quốc tịch: Việt Nam</Text>

                        {/* Section II */}
                        <Text className="font-bold mb-2">II. BÊN ĐƯỢC UỶ QUYỀN</Text>
                        <Text className="mb-1">Họ tên: Phan Thanh Khải</Text>
                        <Text className="mb-1">Địa chỉ: S1.01 Vinhomes Grand Park, Tp. Thủ Đức, TP. Hồ Minh</Text>
                        <Text className="mb-1">Số CMND: 9876545678 cấp ngày: 21/01/2018</Text>
                        <Text className="mb-1">Nơi cấp: tại Công an tỉnh Tp. Hồ Chí Minh</Text>
                        <Text className="mb-4">Quốc tịch: Việt Nam</Text>

                        {/* Section III */}
                        <Text className="font-bold mb-2">III. NỘI DUNG UỶ QUYỀN</Text>
                        <Text className="mb-2">
                            Bên Uỷ quyền đồng ý ủy quyền cho Bên Nhận Ủy quyền thực hiện các hành vi sau đây:
                        </Text>
                        <Text className="mb-1">- Tiếp nhận, định đoạt và định giả tài phẩm từ cá Koi do Bên Uỷ quyền gửi.</Text>
                        <Text className="mb-1">- Được phép kiểm tra và nhận vật phẩm nêu trên khi hoàn thành thủ tục bán/đấu giá.</Text>
                        <Text className="mb-1">- Nhận tiền hoàn lại từ việc bán/đấu giá.</Text>
                        <Text className="mb-4">- Thay mặt bên uỷ quyền thực hiện, giám sát toàn bộ thủ tục bàn giao vật phẩm.</Text>

                        {/* Section IV */}
                        <Text className="font-bold mb-2">IV. CAM KẾT</Text>
                        <Text className="mb-2">
                            - Hai bên cam kết sẽ hoàn toàn chịu trách nhiệm trước Pháp luật về mọi thông tin uỷ quyền ở trên
                        </Text>
                        <Text className="mb-6">
                            - Mọi tranh chấp phát sinh giữa giữa quyền uỷ quyền và bên được uỷ quyền sẽ do hai bên tự giải quyết
                        </Text>

                        {/* Signature sections */}
                        <View className="flex-row justify-between mb-4">
                            <View className="items-center">
                                <Text className="mb-8">BÊN UỶ QUYỀN</Text>
                                <Text>Ký và ghi rõ họ tên</Text>
                            </View>
                            <View className="items-center">
                                <Text className="mb-8">BÊN ĐƯỢC UỶ QUYỀN</Text>
                                <Text>Ký và ghi rõ họ tên</Text>
                            </View>
                        </View>

                        {/* Additional note */}
                        <View className="mt-8">
                            <Text>Tôi đã đọc các điều khoản chính sách của KFS và đồng ý với các điều khoản.</Text>
                        </View>
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
