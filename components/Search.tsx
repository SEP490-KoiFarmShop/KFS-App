import React, { useState } from 'react';
import { View, TextInput, Text, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const SearchComponent = () => {
    const [priceType, setPriceType] = useState('');
    const [sex, setSex] = useState('');
    const [breeder, setBreeder] = useState('');

    return (
        <View className="p-4 bg-gray-100">
            <View className="mb-4 flex-row space-x-4">
                {/* Search by Name */}
                <View className="flex-1">
                    <Text className="text-lg font-bold mb-2">Search name</Text>
                    <TextInput
                        className="border border-black rounded-lg p-5"
                        placeholder="Enter name"
                    />
                </View>

                {/* Select by Price Type */}
                <View className="flex-1 ml-2">
                    <Text className="text-lg font-bold mb-2">Select by price type</Text>
                    <View className="border border-black rounded-lg">
                        <RNPickerSelect
                            onValueChange={(value) => setPriceType(value)}
                            items={[
                                { label: 'Low to High', value: 'low' },
                                { label: 'High to Low', value: 'high' },
                            ]}
                            placeholder={{ label: 'Select price type', value: '' }}
                            style={{
                                inputIOS: {
                                    fontSize: 12,
                                    // padding: 12,
                                    color: 'black',
                                },
                                inputAndroid: {
                                    fontSize: 8,
                                    // padding: 12,
                                    color: 'black',
                                },
                            }}
                            value={priceType}
                        />
                    </View>
                </View>
            </View>

            <View className='flex flex-row space-x-4'>
                {/* Select by Sex */}
                <View className="mb-4 flex-1">
                    <Text className="text-lg font-bold mb-2">Select by sex</Text>
                    <View className="border border-black rounded-lg">
                        <RNPickerSelect
                            onValueChange={(value) => setSex(value)}
                            items={[
                                { label: 'Male', value: 'male' },
                                { label: 'Female', value: 'female' },
                            ]}
                            placeholder={{ label: 'Select sex', value: '' }}
                            style={{
                                inputIOS: {
                                    fontSize: 12,
                                    // padding: 12,
                                    color: 'black',
                                },
                                inputAndroid: {
                                    fontSize: 12,
                                    // padding: 12,
                                    color: 'black',
                                },
                            }}
                            value={sex}
                        />
                    </View>
                </View>

                {/* Select by Breeder */}
                <View className="mb-4 ml-2 flex-1">
                    <Text className="text-lg font-bold mb-2">Select by breeder</Text>
                    <View className="border border-black rounded-lg">
                        <RNPickerSelect
                            onValueChange={(value) => setBreeder(value)}
                            items={[
                                { label: 'Breeder 1', value: 'breeder1' },
                                { label: 'Breeder 2', value: 'breeder2' },
                            ]}
                            placeholder={{ label: 'Select breeder', value: '' }}
                            style={{
                                inputIOS: {
                                    fontSize: 12,
                                    // padding: 12,
                                    color: 'black',
                                },
                                inputAndroid: {
                                    fontSize: 12,
                                    // padding: 12,
                                    color: 'black',
                                },
                            }}
                            value={breeder}
                        />
                    </View>
                </View>
            </View>

        </View>
    );
};

export default SearchComponent;
