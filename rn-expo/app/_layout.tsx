import { Stack } from "expo-router";
import DittoProvider from "./providers/DittoProvider";

export default function RootLayout() {
  return <DittoProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="movie" />
      </Stack>
    </DittoProvider>
}
