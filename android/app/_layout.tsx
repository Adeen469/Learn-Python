import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#f5f5f5",
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: "#000000" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[slug]" options={{ title: "Lesson" }} />
        <Stack.Screen name="creator/[slug]" options={{ title: "Course" }} />
        <Stack.Screen name="video/[lessonId]" options={{ title: "Video" }} />
      </Stack>
    </>
  );
}
