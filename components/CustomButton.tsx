import { Text, TouchableOpacity, View } from 'react-native'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading }: any) => {
    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            className={`rounded-xl flex flex-row justify-center items-center ${containerStyles} ${isLoading ? "opacity-50" : ""}`}
            disabled={isLoading}
        >
            <Text className={`text-white font-psemibold text-lg ${textStyles}`}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default CustomButton;