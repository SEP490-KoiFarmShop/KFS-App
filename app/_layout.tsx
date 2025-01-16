import GlobalProvider from "@/context/GlobalProvider";
import "../global.css"
import { Stack } from "expo-router";

export default function App() {
    return (
        <GlobalProvider>
            <Stack>
                <Stack.Screen name='index' options={{ headerShown: false }} />
                <Stack.Screen name='(auth)' options={{ headerShown: false }} />
                <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                <Stack.Screen name='(components)' options={{ headerShown: false }} />
                {/* <Stack.Screen name='search/[query]' options={{ headerShown: false }} /> */}
            </Stack>
        </GlobalProvider>
    );
}