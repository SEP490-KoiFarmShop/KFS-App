import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';

const layout = () => {
    const { category, koiname } = useLocalSearchParams();
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="KoiByCategory"
                options={({ route }: any) => ({
                    headerShown: true,
                    title: route.params?.category || 'Category',
                })}
            />
            <Stack.Screen
                name="KoiDetailScreen"
                options={({ route }: any) => ({
                    headerShown: true,
                    title: route.params?.koiname || 'Detail',
                })}
            />
        </Stack>
    );
};

export default layout;
