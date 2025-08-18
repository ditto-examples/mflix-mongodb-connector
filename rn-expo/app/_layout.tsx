import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import DittoProvider from "../src/providers/DittoProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <DittoProvider>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#25292e" translucent={false} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              color: '#fff',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="movieDetails" />
          <Stack.Screen name="addMovie" />
        </Stack>
      </SafeAreaProvider>
    </DittoProvider>
  );
}
