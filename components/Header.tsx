import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const Header = () => {
    return (
        <View className="pt-8 px-4 bg-orange-400 rounded-b-2xl">
            <View className="flex flex-row items-center justify-between mb-4">
                <View className="flex flex-row items-center">
                    <Image
                        source={require("../assets/icon/defaultavatar.png")}
                        style={{ width: 45, height: 45, borderRadius: 99 }}
                    />
                    <View className="ml-4">
                        <Text className="text-white text-lg">Welcome,</Text>
                        <Text className="text-white text-xl font-bold">username1</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <AntDesign name="shoppingcart" size={30} color="white" />
                </TouchableOpacity>
            </View>

            <View className="flex flex-row items-center bg-white rounded-full px-4 py-2 shadow-md mb-5">
                <TextInput
                    placeholder="Search something ..."
                    className="flex-1 text-lg text-gray-700"
                    placeholderTextColor="#A0A0A0"
                />
                <TouchableOpacity>
                    <AntDesign name="search1" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Header;

