import React, { useEffect, useState } from "react";
import { View, TextInput, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import CustomButton from "./CustomButton";
import { ActivityIndicator } from "react-native-paper";
import GlobalApi from "@/utils/GlobalApi";

const SearchComponent = ({
  onSearch,
  initialSearchValue = "",
  initialVariety = "",
}: any) => {
  const [type, setType] = useState("");
  const [sex, setSex] = useState("");
  const [breeders, setBreeders] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [selectedBreeder, setSelectedBreeder] = useState("");
  // const [selectedVariety, setSelectedVariety] = useState("");
  const [selectedVariety, setSelectedVariety] = useState(initialVariety);
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [loadingBreeders, setLoadingBreeders] = useState(true);
  const [loadingVarieties, setLoadingVarieties] = useState(true);

  // Update searchValue when initialSearchValue changes
  useEffect(() => {
    if (initialSearchValue) {
      setSearchValue(initialSearchValue);
    }
    if (initialVariety) {
      setSelectedVariety(initialVariety);
    }
  }, [initialSearchValue, initialVariety]);
  const submit = () => {
    onSearch(searchValue, sex, type, selectedVariety, selectedBreeder);
  };

  useEffect(() => {
    const fetchVarieties = async () => {
      try {
        const response = await GlobalApi.getVarieties();
        setVarieties(response);
      } catch (error) {
        console.error("Error fetching varieties:", error);
      } finally {
        setLoadingVarieties(false);
      }
    };

    fetchVarieties();
  }, []);

  useEffect(() => {
    const fetchBreeders = async () => {
      try {
        const response = await GlobalApi.getBreeders();
        setBreeders(response);
      } catch (error) {
        console.error("Error fetching varieties:", error);
      } finally {
        setLoadingBreeders(false);
      }
    };

    fetchBreeders();
  }, []);

  return (
    <View className="p-4 bg-gray-100">
      <View className="mb-4 flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-lg font-bold mb-2">Search name</Text>
          <TextInput
            className="border border-black rounded-lg px-2 h-10 bg-white text-left text-base leading-9"
            placeholder="Enter name"
            value={searchValue}
            onChangeText={setSearchValue}
            style={{ fontSize: 16, paddingVertical: 0, paddingTop: 3 }}
          />
        </View>

        <View className="flex-1 ml-2">
          <Text className="text-lg font-bold mb-2">Select by price type</Text>
          <View className="border border-black rounded-lg bg-white h-10">
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => setType(itemValue)}
              style={{
                height: 52,
                fontSize: 14,
                transform: [{ translateY: -10 }],
              }}
              mode="dropdown"
            >
              <Picker.Item label="Select KOI type" value="" />
              <Picker.Item label="Individual" value="KoiIndividual" />
              {/* <Picker.Item label="Batch" value="KoiBatch" /> */}
              <Picker.Item label="Package" value="KoiPack" />
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
              style={{
                height: 52,
                fontSize: 14,
                transform: [{ translateY: -10 }],
              }}
              mode="dropdown"
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
            {loadingBreeders ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <Picker
                selectedValue={selectedBreeder}
                onValueChange={(itemValue) => setSelectedBreeder(itemValue)}
                style={{
                  height: 52,
                  fontSize: 14,
                  transform: [{ translateY: -10 }],
                }}
                mode="dropdown"
              >
                <Picker.Item label="Select breeder" value="" />
                {breeders.map((item: any) => (
                  <Picker.Item
                    key={item.id}
                    label={item.name}
                    value={item.name.toLowerCase()}
                  />
                ))}
              </Picker>
            )}
          </View>
        </View>
      </View>

      <View className="flex flex-row space-x-4">
        <View className="mb-4 flex-1">
          <Text className="text-lg font-bold mb-2">Select by variety</Text>
          <View className="border border-black rounded-lg bg-white h-10">
            {loadingVarieties ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <Picker
                selectedValue={selectedVariety}
                onValueChange={(itemValue) => setSelectedVariety(itemValue)}
                style={{
                  height: 52,
                  fontSize: 14,
                  transform: [{ translateY: -10 }],
                }}
                mode="dropdown"
              >
                <Picker.Item label="Select variety" value="" />
                {varieties.map((item: any) => (
                  <Picker.Item
                    key={item.id}
                    label={item.name}
                    value={item.name.toLowerCase()}
                  />
                ))}
              </Picker>
            )}
          </View>
        </View>

        <View className="mb-4 ml-2 flex-1">
          <CustomButton
            title="Search"
            handlePress={submit}
            containerStyles="mt-5 bg-orange-500 h-14"
          />
        </View>
      </View>
    </View>
  );
};

export default SearchComponent;
