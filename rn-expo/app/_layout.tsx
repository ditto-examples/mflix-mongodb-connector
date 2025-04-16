import { Stack } from "expo-router";
import DittoProvider from "../src/providers/DittoProvider";

export default function RootLayout() {
  return <DittoProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="movieDetails" />
      </Stack>
    </DittoProvider>
}
