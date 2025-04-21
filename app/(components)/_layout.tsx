import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

const layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="KoiByCategory"
        options={({ route }: any) => ({
          headerShown: true,
          title: route.params?.category || "Category",
        })}
      />
      <Stack.Screen
        name="KoiDetailScreen"
        options={({ route }: any) => ({
          headerShown: true,
          title: route.params?.koiname || "Detail",
        })}
      />
      <Stack.Screen
        name="KoiByBreeder"
        options={({ route }: any) => ({
          headerShown: true,
          title: route.params?.breeder || "Breeder",
        })}
      />
      <Stack.Screen
        name="Cart"
        options={() => ({
          headerShown: false,
          title: "Your Cart",
        })}
      />
      {/* <Stack.Screen
        name="Wallet"
        options={() => ({
          headerShown: false,
          title: "Your Wallet",
        })}
      /> */}
      <Stack.Screen
        name="KoiFishAll"
        options={() => ({
          headerShown: false,
          title: "Koi List",
        })}
      />
      <Stack.Screen
        name="OrderDetail"
        options={() => ({
          headerShown: false,
          title: "Order Detail",
        })}
      />
      <Stack.Screen
        name="OrderSuccess"
        options={() => ({
          headerShown: false,
          title: "Order Success",
        })}
      />
      <Stack.Screen
        name="WalletTransaction"
        options={() => ({
          headerShown: false,
          title: "Wallet Transaction",
        })}
      />
    </Stack>
  );
};

export default layout;
