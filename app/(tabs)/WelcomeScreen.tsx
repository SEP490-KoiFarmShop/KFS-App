import { useRouter } from 'expo-router';
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const WelcomeScreen = () => {
    const router = useRouter();
    return (
        <SafeAreaView className='flex-1' style={{ backgroundColor: "orange" }}>
            <View className='flex-1 flex justify-around my-4'>
                <Text className='text-white text-center font-bold text-4xl'>Let's get Started !!!</Text>
                <View className='flex-row justify-center'>
                    <Image source={require("../../assets/Logo_Team.jpg")} style={{ width: 350, height: 350, borderRadius: 175, }} />
                </View>
                <View className='space-y-4'>
                    <TouchableOpacity onPress={() => router.push('/SignUpScreen')} className='py-3 bg-white mx-7 rounded-xl'>
                        <Text className='text-xl font-bold text-center'>Sign Up</Text>
                    </TouchableOpacity >
                    <View className='flex-row justify-center mt-2'>
                        <Text className='text-white font-semibold'>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/LoginScreen')}>
                            <Text className='font-semibold text-black'>
                                Log In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default WelcomeScreen
