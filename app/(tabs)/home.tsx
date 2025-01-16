import { ScrollView, View } from 'react-native'
import React from 'react'
import Header from '@/components/Header'
import Silder from '@/components/Silder'
import Categories from '@/components/Categories'
import LatestKoi from '@/components/LatestKoi'

const home = () => {
    return (
        <View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Header />
                <View className='p-7'>
                    <Silder />
                    <Categories />
                    <LatestKoi />
                </View>
            </ScrollView>
        </View>
    )
}

export default home