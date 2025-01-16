import { Image, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';

const TabIcon = ({ icon, color, name, focused, iconComponent }: any) => {
    return (
        <View className='items-center justify-center mt-5 w-20'>
            {iconComponent ? (
                <View className='w-6 h-6 mb-1'>
                    {iconComponent}
                </View>
            ) : (
                <Image
                    source={icon}
                    resizeMode='contain'
                    tintColor={color}
                    className='w-6 h-6 mb-1'
                />
            )}
            <Text
                numberOfLines={1}
                className={`${focused ? 'font-psemibold' : 'font-pregular'} text-[12px] text-center`} style={{ color: color }}
            >
                {name}
            </Text>
        </View>
    )
}

const TabsLayout = () => {
    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: "#000000", // Màu chữ và biểu tượng khi tab được chọn (màu đen)
                    tabBarInactiveTintColor: "#000000", // Màu chữ và biểu tượng khi tab không được chọn (màu đen)
                    tabBarStyle: {
                        backgroundColor: "#FFFFFF", // Nền màu trắng
                        borderTopWidth: 1, // Độ dày viền
                        borderTopColor: "#000000", // Viền màu đen
                        height: 58 // Chiều cao của thanh footer
                    }
                }}
            >
                <Tabs.Screen
                    name='home'
                    options={{
                        title: "Home",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                iconComponent={<Feather name="home" size={24} color={color} />}
                                name="home"
                                focused={focused}
                            />
                        )
                    }}
                />
                <Tabs.Screen
                    name='WelcomeScreen'
                    options={{
                        title: "Welcome",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                iconComponent={<Feather name="home" size={24} color={color} />} // Sử dụng `color`
                                color={color}
                                name="WelcomeScreen"
                                focused={focused}
                            />
                        )
                    }}
                />
                <Tabs.Screen
                    name='consignment'
                    options={{
                        title: "Consignment",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                iconComponent={<FontAwesome6 name="pen-to-square" size={24} color={color} />} // Sử dụng `color`
                                color={color}
                                name="Bookmark"
                                focused={focused}
                            />
                        )
                    }}
                />
                <Tabs.Screen
                    name='auction'
                    options={{
                        title: "Auction",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                iconComponent={<Ionicons name="hammer" size={24} color={color} />} // Sử dụng `color`
                                color={color}
                                name="Auction"
                                focused={focused}
                            />
                        )
                    }}
                />
                <Tabs.Screen
                    name='profile'
                    options={{
                        title: "Profile",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                iconComponent={<AntDesign name="profile" size={24} color={color} />} // Sử dụng `color`
                                color={color}
                                name="Profile"
                                focused={focused}
                            />
                        )
                    }}
                />
            </Tabs>
        </>
    )
}


export default TabsLayout
