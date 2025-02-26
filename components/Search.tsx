import React, { useState } from "react";
import { View, TextInput, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import CustomButton from "./CustomButton";

const SearchComponent = () => {
    const [priceType, setPriceType] = useState("");
    const [sex, setSex] = useState("");
    const [breeder, setBreeder] = useState("");
    const [variety, setVariety] = useState("");
    const isLoading = false;

    const submit = async () => {
    };

    return (
        <View className="p-4 bg-gray-100">
            <View className="mb-4 flex-row space-x-4">
                <View className="flex-1">
                    <Text className="text-lg font-bold mb-2">Search name</Text>
                    <TextInput
                        className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9"
                        placeholder="Enter name"
                        style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
                    />
                </View>

                <View className="flex-1 ml-2">
                    <Text className="text-lg font-bold mb-2">Select by price type</Text>
                    <View className="border border-black rounded-lg bg-white h-10">
                        <Picker
                            selectedValue={priceType}
                            onValueChange={(itemValue) => setPriceType(itemValue)}
                            style={{ height: 52, fontSize: 14, transform: [{ translateY: -10 }] }}
                        >
                            <Picker.Item label="Select price type" value="" />
                            <Picker.Item label="Low to High" value="low" />
                            <Picker.Item label="High to Low" value="high" />
                        </Picker>
                    </View>
                </View>
            </View>

            <View className="flex flex-row space-x-4">
                <View className="mb-4 flex-1">
                    <Text className="text-lg font-bold mb-2">Select by sex</Text>
                    <View className="border border-black rounded-lg bg-white h-10">
                        <Picker
                            selectedValue={sex}
                            onValueChange={(itemValue) => setSex(itemValue)}
                            style={{ height: 52, fontSize: 14, transform: [{ translateY: -10 }] }}
                        >
                            <Picker.Item label="Select sex" value="" />
                            <Picker.Item label="Male" value="male" />
                            <Picker.Item label="Female" value="female" />
                        </Picker>
                    </View>
                </View>

                <View className="mb-4 ml-2 flex-1">
                    <Text className="text-lg font-bold mb-2">Select by breeder</Text>
                    <View className="border border-black rounded-lg bg-white h-10">
                        <Picker
                            selectedValue={breeder}
                            onValueChange={(itemValue) => setBreeder(itemValue)}
                            style={{ height: 52, fontSize: 14, transform: [{ translateY: -10 }] }}
                        >
                            <Picker.Item label="Select breeder" value="" />
                            <Picker.Item label="Breeder 1" value="breeder1" />
                            <Picker.Item label="Breeder 2" value="breeder2" />
                        </Picker>
                    </View>
                </View>
            </View>

            <View className="flex flex-row space-x-4">
                <View className="mb-4 flex-1">
                    <Text className="text-lg font-bold mb-2">Select by variety</Text>
                    <View className="border border-black rounded-lg bg-white h-10">
                        <Picker
                            selectedValue={variety}
                            onValueChange={(itemValue) => setVariety(itemValue)}
                            style={{ height: 52, fontSize: 14, transform: [{ translateY: -10 }] }}
                        >
                            <Picker.Item label="Select variety" value="" />
                            <Picker.Item label="Kohaku" value="kohaku" />
                            <Picker.Item label="Ogon" value="ogon" />
                            <Picker.Item label="Showa" value="showa" />
                            <Picker.Item label="Tancho" value="tancho" />
                            <Picker.Item label="Goshiki" value="goshiko" />
                        </Picker>
                    </View>
                </View>

                <View className="mb-4 ml-2 flex-1">
                    <CustomButton title="Search" handlePress={submit}
                        containerStyles="mt-5 bg-orange-500 h-14"
                        isLoading={isLoading}
                    />
                </View>
            </View>
        </View >
    );
};

export default SearchComponent;
