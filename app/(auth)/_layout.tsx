import { Text, View } from 'react-native'
import React from 'react'
import GlobalProvider from '@/context/GlobalProvider'
import { Stack } from 'expo-router'

const layout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='SignUpScreen' options={{ headerShown: false }} />
            <Stack.Screen name='LoginScreen' options={{ headerShown: false }} />
        </Stack>
    )
}

export default layout
