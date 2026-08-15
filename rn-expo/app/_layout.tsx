import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import DittoProvider from "../src/providers/DittoProvider";
import DittoErrorBanner from "../src/components/DittoErrorBanner";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <DittoProvider>
      <SafeAreaProvider>
        {/* Android runs edge-to-edge from Expo SDK 54 on, so the status bar
            background color and translucency can no longer be set here - the
            navigator and DittoErrorBanner apply the insets instead. */}
        <StatusBar style="light" />
        <View style={{ flex: 1 }}>
          <DittoErrorBanner />
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
        </View>
      </SafeAreaProvider>
    </DittoProvider>
  );
}
