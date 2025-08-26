import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";

export default function TabLayout() {
  const lastTapRef = useRef<number>(0);

  const handleMoviesTabPress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // milliseconds
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected - emit event to scroll to top
      global.scrollMoviesToTop?.();
    }
    lastTapRef.current = now;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#25292e',
          borderTopColor: '#3d3d3d',
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#888',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          color: '#fff',
        },
      }}
    >
      <Tabs.Screen
        name="movies"
        options={{
          title: "Movies",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleMoviesTabPress,
        }}
      />
      <Tabs.Screen
        name="system"
        options={{
          title: "System",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}