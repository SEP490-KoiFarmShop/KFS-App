import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DeliveryList" />
      <Stack.Screen name="DeliveryDetail" />
    </Stack>
  );
};

export default Layout;
