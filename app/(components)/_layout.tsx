import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

const layout = () => {
  const { category, koiname, breeder } = useLocalSearchParams();
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
      <Stack.Screen
        name="Wallet"
        options={() => ({
          headerShown: false,
          title: "Your Wallet",
        })}
      />
      {/* <Stack.Screen
        name="ContactInfoScreen"
        options={{
          headerShown: true,
          title: "Contact Info",
        }}
      /> */}
      {/* <Stack.Screen
        name="ConsignmentList"
        options={{
          headerShown: true,
          title: "Consignment List",
        }}
      /> */}
    </Stack>
  );
};

export default layout;
