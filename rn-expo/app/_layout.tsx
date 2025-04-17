import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import DittoProvider from "../src/providers/DittoProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function RootLayout() {
  return (
    <DittoProvider>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#25292e" />
        <Stack>
          <Stack.Screen name="index" />
          <Stack.Screen name="movieDetails" />
          <Stack.Screen name="addMovie" />
        </Stack>
      </SafeAreaProvider>
    </DittoProvider>
  );
}
