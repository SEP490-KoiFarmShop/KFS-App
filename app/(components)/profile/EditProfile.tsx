import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import DuyApi from '@/utils/DuyApi';
import Entypo from '@expo/vector-icons/Entypo';
import { TextInput } from 'react-native-paper';
import CustomButton from '@/components/CustomButton';

export default function EditProfile() {
    const router = useRouter();
    const isLoading = false;
    interface User {
        userId: string;
        username: string;
        email: string;
        password: string;
        phoneNumber: string;
        address: string;
        loyaltyPoints: number;
        walletBalance: number;
        avatarUrl: string;
    }

    const submit = async () => {
    };

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await DuyApi.getAppUsers();
                const users = response?.appUsers; // Lấy danh sách user từ API
                if (users && users.length > 0) {
                    setUser(users[0]); // Gán user đầu tiên vào state
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUser();
    }, []);

    return (
        <ScrollView>

            {/* Arrow Back */}
            <View className='flex-row justify-start'>
                <TouchableOpacity onPress={() => router.back()} className='bg-white p-2 rounded-tr-2xl rounded-bl-2xl ml-4 mt-5'>
                    <Entypo name="chevron-thin-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-black text-lg font-bold mt-7 ml-5">Profile</Text>
            </View>

            <View className="items-center font-semibold mt-3">
                <Image
                    source={{ uri: user?.avatarUrl }}
                    className="w-36 h-36 rounded-full"
                />
                <Text className="text-lg font-medium mt-3">{user?.username}</Text>
            </View>

            <View className="ml-5 mr-5">
                <Text className="text-lg font-bold mb-2">Name</Text>
                <TextInput
                    className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9 mb-3"
                    placeholder={user?.username}
                    style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
                />
                <Text className="text-lg font-bold mb-2">Email</Text>
                <TextInput
                    className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9 mb-3"
                    placeholder={user?.email}
                    style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
                />
                <Text className="text-lg font-bold mb-2">Passsword</Text>
                <TextInput
                    className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9 mb-3"
                    placeholder="*******************"
                    secureTextEntry={true}
                    style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
                />
                <Text className="text-lg font-bold mb-2">Phone number</Text>
                <TextInput
                    className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9 mb-3"
                    placeholder={user?.phoneNumber}
                    style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
                />
            </View>
            <View className="mb-4 ml-2 flex-1">
                <CustomButton
                    title="Submit and Publish"
                    handlePress={() => {
                        console.log("Profile updated");
                    }}
                    containerStyles="mt-5 bg-orange-500 h-14 ml-5 mr-5"
                    isLoading={false}
                />
            </View>
            <View className="flex-row">
                <View className="mb-4 flex-1">
                    <CustomButton
                        title="Auction history"
                        handlePress={() => {
                            console.log("Go to auction history");
                        }}
                        containerStyles="mt-5 bg-blue-500 h-14  ml-5"
                        isLoading={false}
                    />
                </View>
                {/* <View className="mb-4 ml-2 flex-1 ">
            <CustomButton
              title="Transaction history"
              handlePress={() => {
                console.log("Go to trans");
              }}
              containerStyles="mt-5 bg-blue-500 h-14 mr-5"
              isLoading={false}
            />
          </View> */}
                <View className="mb-4 ml-2 flex-1 ">
                    <CustomButton
                        title="Your wallet"
                        handlePress={() => {
                            router.push("/Wallet")
                        }}
                        containerStyles="mt-5 bg-blue-500 h-14 mr-5"
                        isLoading={false}
                    />
                </View>
            </View>
        </ScrollView>
    );
};