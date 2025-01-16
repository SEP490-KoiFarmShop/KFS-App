import { FlatList, Image, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import GlobalApi from '@/utils/GlobalApi'
import Heading from './Heading';

const Silder = () => {
    const [sliders, setSliders] = useState();
    useEffect(() => {
        const fetchSliders = async () => {
            try {
                const response = await GlobalApi.getSlider();
                setSliders(response?.sliders);
            } catch (error) {
                console.error("Error fetching sliders:", error);
            }
        };
        fetchSliders();
    }, []);
    return (
        <View>
            <Heading text={"Offers for you"} />
            <FlatList
                data={sliders}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View>
                        <Image className='w-[270] h-[150] mr-5 rounded-[20px]' resizeMode='stretch' source={{ uri: item?.image?.url }} />
                    </View>
                )}
            />
        </View>
    )
}

export default Silder