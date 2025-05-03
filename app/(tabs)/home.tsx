import { ScrollView, View, RefreshControl } from "react-native";
import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import Slider from "@/components/Silder";
import Categories from "@/components/Categories";
import LatestKoi from "@/components/LatestKoi";

const home = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setRefreshTrigger((prev) => prev + 1);

    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6600"]} // Android
            tintColor="#FF6600" // iOS
          />
        }
      >
        <Header refreshTrigger={refreshTrigger} />
        <View className="p-7">
          <Slider />
          <Categories />
          <LatestKoi />
        </View>
      </ScrollView>
    </View>
  );
};

export default home;
