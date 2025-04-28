import { Linking, ScrollView, View, RefreshControl } from "react-native";
import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import Silder from "@/components/Silder";
import Categories from "@/components/Categories";
import LatestKoi from "@/components/LatestKoi";

const home = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Here you would typically fetch new data
    // For example, refresh your components data or call APIs

    // For demonstration purposes, we'll just wait 1.5 seconds
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);

    // If you have methods to refresh data in your components, call them here
    // Example: refreshCategories();
    // Example: refreshLatestKoi();
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
        <Header />
        <View className="p-7">
          <Silder />
          <Categories />
          <LatestKoi />
        </View>
      </ScrollView>
    </View>
  );
};

export default home;
