import React from 'react'
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
